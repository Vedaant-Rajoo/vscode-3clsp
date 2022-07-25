import * as vscode from 'vscode';
import * as vscodelc from 'vscode-languageclient/node';
import * as path from 'path';
import {ClangdContext} from './clangd-context';
const fse = require('fs-extra');
interface _3CParams {
    textDocument: vscodelc.TextDocumentIdentifier;
}
interface Reply{
    details: string;
}
export const Run3CRequest = 
    new vscodelc.RequestType<_3CParams,Reply,void>('textDocument/run3c');
export function activate(
    context : ClangdContext) {
        let backup = vscode.commands.registerTextEditorCommand(
            'clangd.backup',async (editor,_edit) => {
                if (!vscode.workspace.workspaceFolders) {
                    vscode.window.showInformationMessage("Open a folder/workspace first");
                    return;
                }
                vscode.window.showInformationMessage('Creating a Backup');
                let cuPath = vscode.workspace.workspaceFolders[0].uri.path;
                let oneLessPath = cuPath.substring(0,cuPath.lastIndexOf('/'));
                let projectName = cuPath.substring(cuPath.lastIndexOf('/'),cuPath.length);
                let backupPath = oneLessPath+'/.backup'+projectName;
                fse.ensureDir(backupPath, function (err: any) {
                    console.log(err);
                });
                fse.copy(cuPath,backupPath,(err: any) =>{
                    if(err) return console.error(err)
                    console.log('success');
                })
            }
        );
        let disposable = vscode.commands.registerTextEditorCommand(
            'clangd.run3c', async (editor,_edit) => {
                const converter = context.client.code2ProtocolConverter;
                
                
                const usage = 
                    await context.client.sendRequest(Run3CRequest, {
                        textDocument:
                            converter.asTextDocumentIdentifier(editor.document),
                    });
                vscode.window.showInformationMessage('Running 3C on this project');
                console.log('Running the 3C command');
                const result = usage.details;
                vscode.window.showInformationMessage(result);
            }

        );

        context.subscriptions.push(disposable,backup);
    
}

