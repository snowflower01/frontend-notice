import { useNavigate } from 'react-router-dom'

const Auth = () => {
  const navigate = useNavigate();

  return (
    <>
      <br />
      <h5>접근 할 수 없는 페이지 입니다.</h5>
      <h5>
        로그인 해주세요. 
        <a href='#' onClick={() => navigate('/employee/login')} 
           style={{marginLeft: '10px', fontSize: '1em', fontWeight: 'bold'}}>로그인</a>
      </h5>
      <br></br>
      <img src='./images/auth.png'></img>
    </>
  )
}

export default Auth