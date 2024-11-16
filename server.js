const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // uuid 모듈 불러오기

const app = express();

// JSON 요청을 처리하기 위한 미들웨어
app.use(express.json());

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 'customer_data' 폴더 경로
const baseFolder = path.join(__dirname, 'customer_data');
let nickname2 = "";
let folderName = "";

// '/save-message' 경로 - 닉네임과 편지 내용을 저장
app.post('/save-message', (req, res) => {
    const { nickname, message } = req.body;

    // 요청 데이터 검증
    if (!nickname || !message) {
        return res.status(400).json({ message: '닉네임과 메시지를 모두 입력해주세요.' });
    }

    // UUID를 사용해 고유한 폴더 이름 생성
    folderName = uuidv4();
    nickname2 = nickname;

    // 닉네임 폴더 생성
    const userFolder = path.join(baseFolder, folderName);

    fs.mkdir(userFolder, { recursive: true }, (err) => {
        if (err) {
            return res.status(500).json({ message: '폴더 생성 실패' });
        }

        // 텍스트 파일 경로
        const filePath = path.join(userFolder, `message.txt`);

        // 편지 내용을 텍스트 파일에 저장
        const content = `${message}`;
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

    // 텍스트 파일 경로
    const filePath = path.join(baseFolder, folderName, `info.txt`);

    // 추가 정보를 텍스트 파일에 저장
    const content = `닉네임: ${nickname2}\n\n이름: ${name}\n\n전화번호: ${phone}\n\n주소: ${address}\n\n우편번호: ${zipcode}\n\n레터 콘텐츠: ${letterContent}\n\n수신 거부: ${rejectChecked ? '예' : '아니오'}\n\n`;
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            return res.status(500).json({ message: '정보 저장 실패' });
        } else {
            return res.status(200).json({ message: '정보 저장 완료', filePath });
        }
    });
});

// 서버 시작
app.listen(3000, () => {
    console.log('서버가 3000 포트에서 실행 중입니다.');
});