const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'app/admin'), (filePath) => {
    if (filePath.endsWith('page.tsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;
        
        if (content.includes('navItems') && !content.includes('/admin/withdrawals')) {
            content = content.replace(/\{\s*label:\s*'Báo cáo( & thống kê)?',\s*href:\s*'\/admin\/reports'\s*\}/g, 
                "$&,\n    { label: 'Duyệt Rút Tiền', href: '/admin/withdrawals' }");
            modified = true;
        }

        // Add quick action block in admin/page.tsx
        if (filePath.endsWith('admin\\page.tsx') || filePath.endsWith('admin/page.tsx')) {
            if (!content.includes('onClick={() => router.push(\'/admin/withdrawals\')}')) {
                const quickActionHTML = `
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                onClick={() => router.push('/admin/withdrawals')}
              >
                <span className="text-2xl">💰</span>
                <span className="text-xs font-semibold">Duyệt rút tiền</span>
              </Button>`;
              content = content.replace(/<div className="grid grid-cols-2 gap-4">/g, '<div className="grid grid-cols-2 md:grid-cols-3 gap-4">' + quickActionHTML);
              modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed:', filePath);
        }
    }
});
