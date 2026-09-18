const Home = () => {
  return (
    <div style={{ padding: '20px', fontFamily: '"Noto Sans KR", sans-serif' }}>
      
      {/* 💡 상단 타이틀 영역 (쿠팡 블루 테마로 깔끔하게 정돈) */}
      <div style={{ textAlign: 'left', marginBottom: '25px', paddingLeft: '5px', width: '80%', margin: '0 auto 20px auto' }}>
        <h5 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#0074e4', 
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          coupang <span style={{ color: '#333', fontSize: '18px', fontWeight: '500' }}>풀필먼트 서비스</span>
        </h5>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: '4px 0 0 0' }}>
          공정 사원 통합 관리 시스템
        </p>
      </div>

      {/* 💡 메인 쿠팡 이미지 섹션 (부드러운 라운딩과 연한 보더 처리만 잔류) */}
      <div style={{ textAlign: 'center' }}>
        <img 
          src="./images/cp.jpg" 
          alt="Coupang FC"
          style={{ 
            width: '80%', 
            borderRadius: '8px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid #e9ecef'
          }} 
        />
      </div>

    </div>
  );
};

export default Home;