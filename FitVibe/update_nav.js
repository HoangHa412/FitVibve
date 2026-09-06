const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Update coach pages
walkDir(path.join(__dirname, 'app/coach'), (filePath) => {
    if (filePath.endsWith('page.tsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('navItems') && !content.includes('/coach/wallet')) {
            content = content.replace(/\{ label: 'Kiểm duyệt', href: '\/coach\/moderation' \}/g, "{ label: 'Kiểm duyệt', href: '/coach/moderation' },\n    { label: 'Ví / Rút tiền', href: '/coach/wallet' }");
            fs.writeFileSync(filePath, content);
            console.log('Updated coach:', filePath);
        }
    }
});

// Update admin pages
walkDir(path.join(__dirname, 'app/admin'), (filePath) => {
    if (filePath.endsWith('page.tsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('navItems') && !content.includes('/admin/withdrawals')) {
            content = content.replace(/\{ label: 'Báo cáo', href: '\/admin\/reports' \}/g, "{ label: 'Báo cáo', href: '/admin/reports' },\n    { label: 'Rút tiền', href: '/admin/withdrawals' }");
            fs.writeFileSync(filePath, content);
            console.log('Updated admin:', filePath);
        }
    }
});
