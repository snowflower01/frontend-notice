import { useEffect } from 'react'
import {GlobalStoreSession} from '../../store/store.ts'
import { useNavigate } from 'react-router-dom'

const Member_Logout = () => {
  const navigate = useNavigate();

  const {setLogin, setGrade} = GlobalStoreSession();

  useEffect(
    () => {
      setLogin(false);
      setGrade(99);
      navigate('/');
  }, []);

  return (
    <div>
      Member_Logout
    </div>
  )
}

export default Member_Logout


