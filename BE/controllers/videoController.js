const path = require('path');
const fs = require('fs');

const uploadVideo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file video nào được upload' });
        }
        
        const filename = req.file.filename;
        console.log(`📹 Video uploaded: ${filename} by user ${req.user.id}`);
        
        res.json({
            success: true,
            filename: filename,
            message: 'Upload video thành công'
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi upload video' });
    }
};

const streamVideo = async (req, res) => {
    try {
        const { filename } = req.params;
        
        // Sanitize filename to prevent directory traversal
        const safeName = path.basename(filename);
        const videoPath = path.join(__dirname, '..', 'uploads', 'videos', safeName);
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ message: 'Video không tồn tại' });
        }
        
        const stat = fs.statSync(videoPath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        // Dynamically determine mime-type based on file extension
        const ext = path.extname(videoPath).toLowerCase();
        let mimeType = 'video/mp4'; // default
        if (ext === '.mov') mimeType = 'video/quicktime';
        else if (ext === '.webm') mimeType = 'video/webm';
        else if (ext === '.avi') mimeType = 'video/x-msvideo';
        
        if (range) {
            // Partial content (seeking support)
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            
            const file = fs.createReadStream(videoPath, { start, end });
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            };
            
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            // Full content
            const head = {
                'Content-Length': fileSize,
                'Content-Type': mimeType,
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            };
            
            res.writeHead(200, head);
            fs.createReadStream(videoPath).pipe(res);
        }
    } catch (error) {
        console.error('Stream video error:', error);
        res.status(500).json({ message: 'Lỗi khi phát video' });
    }
};

module.exports = { uploadVideo, streamVideo };
