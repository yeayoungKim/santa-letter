const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // uuid 모듈 불러오기
const https = require('https'); 
const app = express();
const cors = require('cors');
const { userInfo } = require('os');

// JSON 요청을 처리하기 위한 미들웨어
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

const options = {
    key: fs.readFileSync('./root/private.key'), // 개인 키 파일
    cert: fs.readFileSync('./root/certificate.crt'), // SSL/TLS 인증서 파일
    ca: fs.readFileSync('./root/ca_bundle.crt')
  };

// 'customer_data' 폴더 경로
const baseFolder = path.join(__dirname, 'content');
const infoFolder = path.join(__dirname, 'user-info')

// '/save-message' 경로 - 닉네임과 편지 내용을 저장
app.post('/save-message', (req, res) => {
    const { nickname, message } = req.body;

    // 요청 데이터 검증
    if (!nickname || !message) {
        return res.status(400).json({ message: '닉네임과 메시지를 모두 입력해주세요.' });
    }

    //파일 네임 생성
    const fileName = uuidv4();

    // 닉네임 폴더 생성
    const userFolder = path.join(baseFolder);

    fs.mkdir(userFolder, { recursive: true }, (err) => {
        if (err) {
            return res.status(500).json({ message: '폴더 생성 실패' });
        }

        // 텍스트 파일 경로
        const filePath = path.join(userFolder, `${fileName}.txt`);

        // 편지 내용을 텍스트 파일에 저장
        const content =  `닉네임: ${nickname}      \n\n\n메시지: ${message}`;
        fs.writeFile(filePath, content, (err) => {
            if (err) {
                return res.status(500).json({ message: '파일 저장 실패' });
            } else {
                return res.status(200).json({ message: '메시지 저장 완료', filePath });
            }
        });
    });
});

// '/save-info' 경로 - 이름, 주소, 우편번호, 레터 콘텐츠, 수신 거부 상태 저장
app.post('/save-info', (req, res) => {
    const { name, phone, address, zipcode, letterContent, rejectChecked } = req.body;

    // 요청 데이터 검증
    if (!phone || !name || !address || !zipcode || !letterContent) {
        return res.status(400).json({ message: '모든 정보를 입력해주세요.' });
    }
    const fileName = uuidv4();
    // 텍스트 파일 경로
    const filePath = path.join(infoFolder, `${fileName}.txt`);

    // 추가 정보를 텍스트 파일에 저장
    const content = `이름: ${name}\n\n전화번호: ${phone}\n\n주소: ${address}\n\n우편번호: ${zipcode}\n\n레터 콘텐츠: ${letterContent}\n\n수신 거부: ${rejectChecked ? '예' : '아니오'}\n\n`;
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            return res.status(500).json({ message: '정보 저장 실패' });
        } else {
            return res.status(200).json({ message: '정보 저장 완료', filePath });
        }
    });
});

// 서버 시작
app.listen(80, () => {
    console.log('서버가 80 포트에서 실행 중입니다.');
});


https.createServer(options, app).listen(3000, function() {
    console.log("HTTPS server listening on port " + 3000);
  });