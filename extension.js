// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	let disposable = vscode.commands.registerCommand('css-generator.generateCSS', function (currentFile) {
		if (vscode.workspace.workspaceFolders[0].uri.path) {

			vscode.workspace.openTextDocument(currentFile).then(document => {
				let classList = []
				let doc = document.getText();
				let classSingleIndices = []
				let classDoubleIndices = []
				let regexSingle = /class\=\'/g
				let regexDouble = /class\=\"/g
				let res;

				while ( (res = regexSingle.exec(doc)) !== null ){
					classSingleIndices.push(res.index)
				}
				while (res = regexDouble.exec(doc)){
					classDoubleIndices.push(res.index)
				}

				let classSingleList = classSingleIndices.map(index => getLastIndex(index, doc, "'"))
				let classDoubleList = classDoubleIndices.map(index => getLastIndex(index, doc, '"'))
				classList = [...classSingleList, ...classDoubleList]
				let uniqueClasses = [...new Set(classList)]

				const wsFullPath = document.uri.fsPath
				const wsfPath = wsFullPath.substring(0, wsFullPath.lastIndexOf('.'))
				const filePath = vscode.Uri.file(wsfPath + '.css')
				
				let classString = ""
				uniqueClasses.forEach(uniqueClass => {
					classString += `.${uniqueClass} {\n\t\n}\n\n`
				})

				let wsEdit = new vscode.WorkspaceEdit()
				vscode.window.showInformationMessage(filePath.toString())
				wsEdit.deleteFile(filePath, { ignoreIfNotExists: true })
				vscode.workspace.applyEdit(wsEdit)
				wsEdit = new vscode.WorkspaceEdit()
				wsEdit.createFile(filePath, { ignoreIfExists: true })
				wsEdit.insert(filePath, new vscode.Position(0, 1), classString)
				vscode.workspace.applyEdit(wsEdit)
				vscode.window.showInformationMessage(`CSS file generated with ${uniqueClasses.length} classes.`)

			}).then(undefined, err => {
				console.log("ERROR");
				console.error(err);
			})
		}

		vscode.window.showInformationMessage('Hello World from VS Code!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

function getLastIndex(index, doc, char) {
	let soi = doc.substring(index+7, doc.length-1)
	let endIndex = soi.indexOf(char)
	let res = doc.substring(index+7, endIndex+index+7)
	return res
}

module.exports = {
	activate,
	deactivate
}
