import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GlobalStoreSession } from './store/store';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
// 📝 Menu.tsx 상단 선언부 교정

  const login = GlobalStoreSession((state: any) => state.login);
  const id = GlobalStoreSession((state: any) => state.id);
  
  // 🎯 [정밀 타격] ?? [] 를 지워 매번 새로운 빈 배열 주소가 생성되어 루프 돌던 현상을 원천 차단합니다!
  const categories = GlobalStoreSession((state: any) => state.categories); 
  
  const loadCategories = GlobalStoreSession((state: any) => state.loadCategories);
  
  const setLogin = GlobalStoreSession((state: any) => state.setLogin);
  const setId = GlobalStoreSession((state: any) => state.setId);
  const setGrade = GlobalStoreSession((state: any) => state.setGrade);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // 🎯 [이전의 안전장치 useEffect는 그대로 유지]
  useEffect(() => {
    // 만약 categories가 빈 배열이거나 없을 때 안전하게 방어하기 위해 여기에 체크를 얹습니다.
    const hasNoCategories = !categories || categories.length === 0;
    
    if (login && loadCategories && hasNoCategories) {
      loadCategories();
      console.log('-> [디버깅] 원래 형태 유지하며 매핑 성공');
    }
  }, [login, loadCategories, categories]); // location은 빼고 원래대로 가둡니다.

  useEffect(() => {
    setIsAdminOpen(false);
    setOpenDropdown(null);
  }, [location]);

  // ... 이하 하단 HTML (Link, 테이블, 회원목록 등) 코드는 완벽히 그대로 유지 ...

  const handleLogout = () => {
    if (setLogin) setLogin(false);
    if (setId) setId('');
    if (setGrade) setGrade(99); 
    sessionStorage.clear();
    alert('로그아웃 되었습니다.');
    navigate('/member/login');
  };

  // 📝 Menu.tsx 53번째 라인 부근 정밀 교정

  // 🎯 [정밀 타격] categories 뒤에 ?. 을 붙이거나 || [] 를 씌워 초기 undefined 상태일 때의 크래시를 방방합니다.
  const uniqueGroups = Array.from(new Set((categories || []).map((item: any) => item.grp))).filter(Boolean);

  return (
    <nav className="navbar navbar-expand-lg navbar-light" style={{ 
      backgroundColor: '#f8f9fa', 
      padding: '20px 0', 
      borderBottom: '1px solid #dee2e6' 
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div className="mb-3" style={{ textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', fontWeight: '900', color: '#0073e6', fontSize: '24px' }}>
            📦 쿠팡 CFS 가이드
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <ul style={{ 
            display: 'flex', flexDirection: 'row', alignItems: 'center', listStyle: 'none', 
            margin: 0, padding: 0, gap: '15px', fontSize: '16px', fontWeight: 'bold'
          }}>
            
            <li>
              <Link to="/" style={{ color: '#212529', textDecoration: 'none' }}>Home</Link>
            </li>
            
            {login && (
              <>
                <li style={{ color: '#ccc' }}>|</li>
                <li>
                  <Link to="/notice/list" style={{ color: '#212529', textDecoration: 'none' }}>공지사항</Link>
                </li>
              </>
            )}

            {login && uniqueGroups.map((grpName: any) => {
              const subItems = categories.filter((c: any) => c.grp === grpName);
              const isOpen = openDropdown === grpName;

              return (
                <React.Fragment key={grpName}>
                  <li style={{ color: '#ccc' }}>|</li>
                  <li className="nav-item dropdown" style={{ position: 'relative' }}>
                    <span 
                      className="nav-link dropdown-toggle" 
                      onClick={() => setOpenDropdown(isOpen ? null : grpName)}
                      style={{ color: '#212529', cursor: 'pointer' }}
                    >
                      {grpName}
                    </span>
                    <ul className={`dropdown-menu ${isOpen ? 'show' : ''}`} style={{ 
                      position: 'absolute', top: '100%', left: '0', display: isOpen ? 'block' : 'none',
                      margin: 0, boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }}>
                      {subItems.map((sub: any) => (
                        <li key={sub.cateno}>
                          <Link className="dropdown-item" to={`/contents/list_all/${sub.cateno}`}>
                            {sub.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                </React.Fragment>
              );
            })}

            {login && (
              <>
                <li style={{ color: '#ccc' }}>|</li>
                <li className="nav-item dropdown" style={{ position: 'relative' }}>
                  <span 
                    className="nav-link dropdown-toggle" 
                    onClick={() => {
                      setIsAdminOpen(!isAdminOpen);
                      setOpenDropdown(null);
                    }}
                    style={{ color: '#dc3545', cursor: 'pointer' }}
                  >
                    관리자
                  </span>
                  <ul className={`dropdown-menu ${isAdminOpen ? 'show' : ''}`} style={{ 
                    position: 'absolute', top: '100%', left: '0', display: isAdminOpen ? 'block' : 'none',
                    margin: 0, boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}>
                    <li><Link className="dropdown-item" to="/member/find_all">회원목록</Link></li>
                    <li><Link className="dropdown-item" to="/cate/cate">카테고리등록</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><span className="dropdown-item-text text-muted" style={{ fontSize: '13px' }}>프로그램 정보</span></li>
                  </ul>
                </li>
              </>
            )}

            {login ? (
              <>
                <li style={{ color: '#ccc' }}>|</li>
                <li style={{ color: '#495057' }}>
                  🔑 <b>{id}</b> 사원님
                </li>
                <li style={{ color: '#ccc' }}>|</li>
                <li>
                  <button className="btn btn-sm btn-outline-danger" onClick={handleLogout} style={{ padding: '2px 8px', fontWeight: 'bold' }}>
                    로그아웃
                  </button>
                </li>
              </>
            ) : (
              <>
                <li style={{ color: '#ccc' }}>|</li>
                <li><Link to="/member/login" style={{ color: '#0073e6', textDecoration: 'none' }}>로그인</Link></li>
                <li style={{ color: '#ccc' }}>|</li>
                <li><Link to="/member/signup" style={{ color: '#495057', textDecoration: 'none' }}>회원가입</Link></li>
              </>
            )}

          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Menu;