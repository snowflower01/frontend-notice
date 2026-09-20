import axios from 'axios';
import type { KeyboardEvent } from 'react';

// 1. getIP 함수: 현재 접속한 브라우저의 호스트(IP/도메인)를 자동으로 반환
const getIP = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return "localhost";
}

const getCopyright = () => {
  return "쿠팡 단기 아르바이트";
}

const getNowDate = () => {
      // 현재 날짜와 시간을 가져옵니다.
    const now = new Date();

    // 날짜와 시간을 "YYYY-MM-DD HH:mm:ss" 형식으로 변환합니다.
    const rdate = now.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/- /g, '-').replace(/ /, ' ').trim().slice(0, -1);

    return rdate.replace(/-([0-9]{2}:)/, ' $1'); // 2024-11-06 16:29:5
}

// 포커스 이동
function enter_chk(e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent, nextTag: string){
  if(e.key === 'Enter'){ // 엔터키
    e.preventDefault();
    const nextElement = document.getElementById(nextTag);
    if(nextElement) {
      nextElement.focus();
    }
  }
}

function set_focus(nextTag: string){
  const nextElement = document.getElementById(nextTag);
  if(nextElement) {
    nextElement.focus();
  }
}

// 2. axiosInstance 설정: getIP()를 활용하여 동적으로 baseURL 구성
const axiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? '' : `http://${getIP()}:9101`
})

// 파일 다운로드 함수
const download = async (dir:string, filename: string, downname: string) => {
  try {
    // ① Spring Boot의 Download.java /download 엔드포인트 호출
    // dir: 폴더명, filename: 서버에 저장된 파일명, downname: 원래 파일명
    const response = await axiosInstance.get("/download", {
      params: { dir, filename, downname },  // 쿼리 파라미터 전달
      responseType: "blob",                 // 응답을 binary(blob)로 받기
    });

    // ② 서버에서 받은 데이터를 Blob(바이너리) 객체로 생성
    const blob = new Blob([response.data]);

    // ③ Blob 데이터를 브라우저가 다운로드할 수 있는 URL로 변환
    const url = window.URL.createObjectURL(blob);

    // ④ 임시로 <a> 태그를 만들어서 클릭 이벤트를 트리거
    const link = document.createElement("a");
    link.href = url;                // Blob 데이터의 URL 지정
    link.download = downname;       // 실제 저장될 파일 이름 지정

    // ⑤ <a> 태그를 문서에 추가하고, 강제로 클릭해서 다운로드 실행
    document.body.appendChild(link);
    link.click();

    link.remove(); // ⑥ 클릭 후 <a> 태그 제거 
    window.URL.revokeObjectURL(url); // Blob URL 해제(메모리 누수 방지)

  } catch (err) {
    // ⑦ 예외 처리: 다운로드 실패 시 경고 및 로그 출력
    alert("파일 다운로드 중 오류가 발생했습니다.");
    console.error(err);
  }
};

const isImage = (file1: string = ""): boolean => {
  // console.log('-> file1.toLowerCase():', "ABC.jpg".toLowerCase());
  // console.log('-> file1.toLowerCase().endsWith(\'jpg\'):', "ABC.jpg".toLowerCase().endsWith('jpg'));

  if (file1 != null) {
    return ['jpg', 'jpeg', 'png', 'gif', 'jfif', 'webp'].some(ext => file1.toLowerCase().endsWith(ext));
  } else {
    return false;
  }
  
}

// id 추출
// https://www.youtube.com/shorts/Jvq4C5edovQ
// https://www.youtube.com/watch?v=4W5uXlHNIHM&list=RD4W5uXlHNIHM&start_radio=1
const getYoutubeId = (v = '') => {
  const s = v.trim();
  // watch?v= / youtu.be / embed / shorts 모두 지원
  const m = s.match(
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (m) {
    console.log('-> Youtube id m[1]:' + m[1]);
    return m[1];

  } else if (/^[A-Za-z0-9_-]{11}$/.test(s)) {
    console.log('-> Youtube id s:' + s);
    return s; // 11자리면 ID로 간주

  } else {
    return null;
    
  }

};

function extractKakaoMapInfo(html:string): string {
  // div id 추출
  const idMatch = html.match(/<div\s+id="([^"]+)"/);
  const id = idMatch ? idMatch[1] : '';

  // timestamp 추출
  const tsMatch = html.match(/"timestamp"\s*:\s*"(\d+)"/);
  const timestamp = tsMatch ? tsMatch[1] : '';

  // key 추출
  const keyMatch = html.match(/"key"\s*:\s*"([a-zA-Z0-9]+)"/);
  const key = keyMatch ? keyMatch[1] : '';

  if (!id || !timestamp || !key) return '';

  return `${id}/${timestamp}/${key}`;
}

// ["daumRoughmapContainer1762848321274", "1762848321274", "cz89ag36uw3"]
function splitKakaoMapString(str:string) {
  if (!str) return [];           // 빈 값이면 빈 배열 반환
  return str.split('/');         // '/' 기준으로 문자열 분리
}

export {getIP, getCopyright, getNowDate, enter_chk, set_focus, axiosInstance, download, isImage, getYoutubeId, extractKakaoMapInfo, splitKakaoMapString}; 
// import {getIP, getCopyright, getNowDate, enter_chk, set_focus, axiosInstance, download, isImage} from 'Tool';

