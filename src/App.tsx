import './App.css'
import Menu from './Menu'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { getCopyright } from './components/Tool';
import Home from './components/Home'

// 💡 1. 개인 프로젝트 Member 컴포넌트 일괄 임포트 (원본 100% 보존)
import Signup from './components/member/Signup'; 
import Member_Find_all from './components/member/Member_Find_all';
import Member_Read from './components/member/Member_Read';
import Member_Update_password from './components/member/Member_Update_password';
import Member_Update from './components/member/Member_Update';
import Member_Delete from './components/member/Member_delete';
import Member_Login from './components/member/Member_Login';
import Member_Logout from './components/member/Member_Logout';
import Auth from './components/Auth';
import Cate from './components/cate/Cate';
import Notice_List from './components/notice/Notice_List';
import Contents_List_all from './components/contents/Contents_List_all';
import Contents_Create from './components/contents/Contents_Create';
import Contents_Read from './components/contents/Contents_Read';
import Contents_Update_text from './components/contents/Contents_Update_text';
import Contents_Update_file1 from './components/contents/Contents_Update_file1';

function App() {

  return (
    <BrowserRouter>
      <div style={{width: '100%'}}>
        <Menu />
        <Routes>
          {/* 🏠 오직 첫 메인 주소('/') 일 때만 컨베이어 벨트 메인 이미지(<Home />) 출력 */}
          <Route path='/' element={<Home />} />
          <Route path='/notice/find_all' element={<Notice_List />} />
          
          {/* 💡 2. Menu.tsx의 주소들과 1:1로 정확하게 대응하는 Route 경로 배치 (원본 보존) */}
          <Route path='/member/signup' element={<Signup />} />
          <Route path='/member/find_all' element={<Member_Find_all />}/>
          <Route path='/member/read/:memberno' element={<Member_Read />}/>
          <Route path='/member/update_password' element={<Member_Update_password />}/>
          <Route path='/member/update/:memberno' element={<Member_Update/>}/>
          <Route path='/member/delete/:memberno' element={<Member_Delete />}/>
          
          <Route path='/member/logout' element={<Member_Logout/>}/> 
          <Route path='/member/login' element={<Member_Login/>}/>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* 🎯 [완벽 교정] 메뉴판 클릭 시 진짜 가이드 리스트가 출력되는 다이렉트 통로 개방 */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path='/contents/list_all/:cateno' element={<Contents_List_all/>}/>
          <Route path='/contents/create/:cateno' element={<Contents_Create/>}/>
          <Route path='/contents/read/:contentsno' element={<Contents_Read/>}/>
          <Route path='/contents/update_text/:contentsno' element={<Contents_Update_text/>}/>
          <Route path='/contents/update_file1/:contentsno' element={<Contents_Update_file1/>}/>
          
          
          
          

          {/* 📌 쿠팡 기획 반영: 카테고리 관리 기능 라우터 유지 */}
          <Route path='/cate/cate' element={<Cate />}/>
          <Route path='auth' element={<Auth />}/>

          <Route path='/info' /> 
        </Routes>

        <div className='copyright'>{getCopyright()}</div>      
      </div>
    </BrowserRouter>
  )
}

export default App;