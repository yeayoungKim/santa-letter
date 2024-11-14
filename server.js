const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

// JSON 요청을 처리하기 위한 미들웨어
app.use(express.json());

// 정적 파일을 제공하기 위해 'public' 폴더를 사용
app.use(express.static(path.join(__dirname, 'public')));

// '/save-message' 경로에서 POST 요청을 처리
app.post('/save-message', (req, res) => {
    const { nickname, message } = req.body;

    if (!nickname || !message) {
        return res.status(400).json({ message: '닉네임과 메시지를 모두 입력해주세요.' });
    }

    const content = `보낸 사람: ${nickname}\n메시지: ${message}\n\n`;

    // 'letter.txt' 파일에 저장
    fs.appendFile('letter.txt', content, (err) => {  // appendFile로 기존 파일에 추가
        if (err) {
            return res.status(500).json({ message: '파일 저장 실패' });
        } else {
            return res.status(200).json({ message: '저장 완료' });
        }
    });
});

// 서버 시작
app.listen(3000, () => {
    console.log('서버가 3000 포트에서 실행 중입니다.');
});