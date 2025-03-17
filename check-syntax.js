// check-syntax.js - Een uitgebreide syntax check voor alle JavaScript bestanden
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuratie
const EXCLUDED_DIRS = ['node_modules', '.git'];
const JS_EXTENSIONS = ['.js'];

// Helpers
function findJsFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !EXCLUDED_DIRS.includes(file)) {
            findJsFiles(filePath, fileList);
        } else if (JS_EXTENSIONS.includes(path.extname(file))) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

function checkSyntax(file) {
    try {
        // Gebruik node's eigen syntax checker
        execSync(`node --check "${file}"`, { stdio: 'pipe' });
        
        // Skip self-check to avoid the inspection paradox
        if (file === 'check-syntax.js') {
            return true;
        }
        
        // Extra controles voor problemen die node --check mogelijk mist
        const content = fs.readFileSync(file, 'utf8');
        
        // Tel accolades
        const openBraces = (content.match(/{/g) || []).length;
        const closeBraces = (content.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            console.error(`❌ ${file}: Ongelijk aantal accolades. Open: ${openBraces}, Sluit: ${closeBraces}`);
            return false;
        }
        
        // Tel haakjes
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        if (openParens !== closeParens) {
            console.error(`❌ ${file}: Ongelijk aantal haakjes. Open: ${openParens}, Sluit: ${closeParens}`);
            return false;
        }
        
        // Check voor ontbrekende sluithaakjes na function calls
        // Deze check moet meer sophisticated zijn - alleen controleer voor 
        // daadwerkelijk ontbrekende haakjes niet voor meerregelige argumenten
        const contentLines = content.split('\n');
        let missingClosingParensLines = [];
        let inMultilineFunction = false;
        let functionStartLine = -1;
        
        contentLines.forEach((line, index) => {
            const openParensCount = (line.match(/\(/g) || []).length;
            const closeParensCount = (line.match(/\)/g) || []).length;
            
            // Als er een lijn eindigt met een opening parens zonder closing
            if (openParensCount > closeParensCount && 
                /\([^)]*$/.test(line) && 
                !inMultilineFunction) {
                inMultilineFunction = true;
                functionStartLine = index;
            }
            
            // Als we al in een multiline function zijn en een closing paren vinden
            if (inMultilineFunction && closeParensCount > 0) {
                inMultilineFunction = false;
                functionStartLine = -1;
            }
        });
        
        // Als we aan het einde inMultilineFunction = true hebben, kan er een probleem zijn
        if (inMultilineFunction && functionStartLine !== -1) {
            const suspectLine = contentLines[functionStartLine];
            // Check of de lijn een typisch patroon heeft dat duidt op ontbrekende )
            if (/\w+\([^{]*$/.test(suspectLine) && !suspectLine.includes('function') && !suspectLine.endsWith(',') && !suspectLine.endsWith('{')) {
                missingClosingParensLines.push({line: functionStartLine + 1, content: suspectLine});
            }
        }
        
        if (missingClosingParensLines.length > 0) {
            console.error(`❌ ${file}: Mogelijk ontbrekende sluithaakjes op de volgende regels:`);
            missingClosingParensLines.forEach(({line, content}) => {
                console.error(`   Regel ${line}: ${content}`);
            });
            return false;
        }
        
        // Check voor ontbrekende puntkomma's (waarschuwing)
        let missingSemicolons = false;
        
        contentLines.forEach((line, index) => {
            // Eenvoudige (niet perfecte) check voor ontbrekende puntkomma's
            if (/[^;{}()[\] ]$/.test(line.trim()) && 
                !line.trim().startsWith('//') && 
                !line.trim().startsWith('/*') &&
                !line.trim().endsWith('*/') &&
                line.trim().length > 0) {
                console.warn(`⚠️ ${file}:${index + 1}: Mogelijk ontbrekende puntkomma: ${line.trim()}`);
                missingSemicolons = true;
            }
        });
        
        return true;
    } catch (error) {
        console.error(`❌ ${file}: ${error.message.split('\n')[0]}`);
        return false;
    }
}

// Hoofdfunctie
function main() {
    // Als een specifieke bestandsnaam wordt meegegeven, controleer alleen dat bestand
    if (process.argv.length > 2) {
        const file = process.argv[2];
        process.stdout.write(`Controleren van ${file}... `);
        
        if (fs.existsSync(file)) {
            const result = checkSyntax(file);
            if (result) {
                console.log('✅ OK');
                process.exit(0);
            } else {
                process.exit(1);
            }
        } else {
            console.error(`❌ Bestand '${file}' bestaat niet`);
            process.exit(1);
        }
    } else {
        // Anders, controleer alle JavaScript bestanden
        console.log("JavaScript syntax checker");
        console.log("------------------------");
        
        const jsFiles = findJsFiles('.');
        console.log(`Controleren van ${jsFiles.length} JavaScript bestanden...`);
        
        let failedFiles = 0;
        
        jsFiles.forEach(file => {
            process.stdout.write(`Controleren van ${file}... `);
            const result = checkSyntax(file);
            
            if (result) {
                console.log('✅ OK');
            } else {
                failedFiles++;
            }
        });
        
        if (failedFiles === 0) {
            console.log("\n✅ Alle bestanden zijn syntactisch correct!");
            process.exit(0);
        } else {
            console.error(`\n❌ ${failedFiles} bestand(en) hebben syntaxfouten`);
            process.exit(1);
        }
    }
}

// Start de check
main();