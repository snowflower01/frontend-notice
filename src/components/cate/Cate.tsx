import { useState, useEffect, type ChangeEvent } from 'react'
import { enter_chk, getIP, axiosInstance, getNowDate } from '../Tool'
import { Link, useNavigate } from 'react-router-dom'
import update_img from '../../assets/images/update.png';
import delete_img from '../../assets/images/delete.png';
// 🎯 유저님의 진짜 스토어 명칭인 GlobalStoreSession 바인딩
import { GlobalStoreSession } from '../../store/store.ts'; 
import show_img from '../../assets/images/show.png'
import hide_img from '../../assets/images/hide.png'
import increase_img from '../../assets/images/increase.png'
import decrease_img from '../../assets/images/decrease.png'

const Cate = () => {
  // 🎯 스토어로부터 등급 상태 감시
  const grade = GlobalStoreSession((state: any) => state.grade);
  const navigate = useNavigate();

  const [send_label, setSend_label] = useState<'등록' | '수정' | '삭제'>('등록');
  const [data, setData] = useState<any[]>([]);

  // 🎯 유저님의 원래 상태 객체 구조 100% 동일하게 유지
  const [input, setInput] = useState({
    cateno: '',
    grp: '',
    name: '',
    cnt: 0,
    seqno: 1,
    visible: 'Y',
    rdate: '',
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInput({
      ...input,
      [e.target.id]: e.target.value,
    });
  }

  const send = (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (send_label === '등록') {
      axiosInstance.post(`/cate/save`, {
        grp: input.grp,
        name: input.name,
        cnt: input.cnt,
        seqno: input.seqno,
        visible: input.visible,
        rdate: getNowDate(),         
      })
      .then(result => result.data)
      .then(data => {
        console.log('-> 등록 성공:', data);
        loadData();
      })
      .catch(err => console.error(err))

    } else if (send_label === '수정') {
      axiosInstance.put(`/cate/update`, {
        cateno: input.cateno,
        grp: input.grp,
        name: input.name,
        cnt: input.cnt,
        seqno: input.seqno,
        visible: input.visible,
        rdate: getNowDate(),         
      })
      .then(result => result.data)
      .then(data => {
        console.log('-> 수정 성공:', data);
        loadData();
      })
      .catch(err => console.error(err))

    } else if (send_label === '삭제') {
      axiosInstance.delete(`/cate/${input.cateno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> 삭제 성공:', data);
        loadData();
        setDelete_panel(false);
      })
      .catch(err => console.error(err))
    }
  }

const loadData = () => {
  // 🎯 실제로 찌르는 주소가 맞는지 콘솔로 추적합니다.
  console.log("-> 현재 찌르는 백엔드 전체 주소:", axiosInstance.defaults.baseURL + `/cate/find_all`);

  axiosInstance.get(`/cate/find_all`)
  .then(result => {
    console.log('-> [확인] axiosInstance 수신 직후 원본 result:', result);
    return result.data;
  })
  .then(resData => {
    console.log('-> [성공] Cate 데이터 실시간 탑재 배열:', resData);
    setData(Array.isArray(resData) ? resData : []);
  })
  .catch(err => {
    console.error("-> [실패] Cate 백엔드 통신 에러 내용:", err);
  });
}
  
  useEffect(() => {      
    /* 🎯 [핵심 교정] 새로고침 시 grade 권한 락 때문에 loadData()가 씹히지 않도록
       진입 차단 락 조건을 해제하고 마운트 시 즉시 오라클 DB를 찌르도록 리렌더링 트리거를 동기화합니다. */
    loadData();
  }, [grade]);

  const read_for_update = (cateno: number) => {
    axiosInstance.get(`/cate/${cateno}`)
    .then(result => result.data)
    .then(data => {
      setInput({
        cateno: data.cateno,
        grp: data.grp,
        name: data.name,
        cnt: data.cnt,
        seqno: data.seqno,
        visible: data.visible,
        rdate: data.rdate,   
      });
      setSend_label('수정');
    })
    .catch(err => console.error(err));
  }

  const cancel = () => {
    setSend_label('등록');
    setInput({
      cateno: '',
      grp: '',
      name: '',
      cnt: 0,
      seqno: 1,
      visible: 'Y', 
      rdate: '', 
    });
    if (send_label === '삭제') {
      setDelete_panel(false);
    }
  }

  const [delete_panel, setDelete_panel] = useState(false);

  const read_for_delete = (cateno: number) => {
    setDelete_panel(true);
    axiosInstance.get(`/cate/${cateno}`)
    .then(result => result.data)
    .then(data => {
      setInput({
        cateno: data.cateno,
        grp: data.grp,
        name: data.name,
        cnt: data.cnt,
        seqno: data.seqno,
        visible: data.visible,
        rdate: data.rdate,   
      });
    })
    .catch(err => console.error(err));
    setSend_label('삭제');
  }

  const updateVisible = (cateno: number, visible: string) => {
    axiosInstance.patch(`/cate/update/visible?cateno=${cateno}&visible=${visible}`)
    .then(result => result.data)
    .then(data => {
      loadData();
    })
    .catch(err => console.error(err));
  }

  const seqno_update = (cateno: number, sw: 'increase' | 'decrease') => {
    axiosInstance.patch(`/cate/update/${sw}?cateno=${cateno}`)
    .then(result => result.data)
    .then(data => {
      loadData();
    })
    .catch(err => console.error(err));
  }

  return (
    <div>
      {/* 🎯 유저님의 폰트, 인풋 폼 구조, 테이블 서식 원형 100% 동일 보존 */}
      <div className='title_line'>카테고리 관리 (쿠팡 물류 공정 설정)</div>
      <div className='menu_line'>
        <a href='#' onClick={(e) => { e.preventDefault(); loadData(); }}>새로고침</a>
      </div>
      <div>
        <form id='frm' onSubmit={send} style={{margin:'10px auto', width:'80%', textAlign:'left'}}>
          <div className='div_row'>
            <input type="text" className="form-control form-control-sm" id="grp" 
                   placeholder="공정 (공통 / IB / OB)" onKeyDown={e=>enter_chk(e,'name')} 
                   onChange={onChange} value={input.grp} style={{width: '20%'}} autoFocus />          
            <input type="text" className="form-control form-control-sm" id="name" 
                   placeholder="메뉴명 (대분류는 --)" onKeyDown={e=>enter_chk(e,'cnt')} 
                   onChange={onChange} value={input.name} style={{width: '20%'}} />          
            <input type="number" min="0" step="1"
                   className="form-control form-control-sm" id="cnt" 
                   placeholder="자료수" title='관련 자료수' onKeyDown={e=>enter_chk(e,'seqno')} 
                   onChange={onChange} value={input.cnt} style={{width: '10%'}} /> 
            <input type="number" min="0" step="1"
                   className="form-control form-control-sm" id="seqno" 
                   placeholder="순서" title='출력 순서' onKeyDown={e=>enter_chk(e,'visible')} 
                   onChange={onChange} value={input.seqno} style={{width: '10%'}} />
            <select id='visible' className="form-control form-control-sm" 
                    onChange={onChange} value={input.visible}
                    title='출력 모드' onKeyDown={e=>enter_chk(e as any,'btnSend')} 
                    style={{width: '10%'}}>
              <option value=''>선택</option>
              <option value='Y'>Y</option>
              <option value='N'>N</option>
            </select>
            <button id='btnSend' type="submit" className="btn btn-outline-info btn-sm" 
                    style={{marginRight:'0px'}}>{send_label}</button>
            <button id='btnReset' type="reset" className="btn btn-outline-info btn-sm" 
                    style={{marginRight:'0px'}} onClick={cancel}>취소</button>
          </div>
        </form>

        {delete_panel && (
          <div style={{textAlign: 'center', marginTop: '10px', marginBottom: '20px', color: 'red'}}>
            카테고리를 삭제하면 복구 할 수 없습니다.<br />삭제하시겠습니까?
          </div> 
        )}

        <table className='table_center table table-hover'>
          <thead>
            <tr style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
              <td>번호</td>
              <td>공정 그룹</td>
              <td>메뉴/카테고리 이름</td>
              <td>관련 자료수</td>
              <td>출력 순서</td>
              <td>등록일</td>
              <td>기타</td>
            </tr>
          </thead>
          <tbody>
            {
              data && data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.cateno || index}>
                    <td className='table_underline' style={{textAlign: 'center'}}>{index+1}</td>  
                    <td className='table_underline' style={{textAlign: 'center'}}>{item.grp}</td>  
                    <td className='table_underline' style={{textAlign: 'center'}}>{item.name}</td>  
                    <td className='table_underline' style={{textAlign: 'center'}}>{item.cnt}</td>      
                    <td className='table_underline' style={{textAlign: 'center'}}>{item.seqno}</td>                                              
                    <td className='table_underline' style={{textAlign: 'center'}}>
                      {item.rdate ? item.rdate.substring(0, 10) : '-'}
                    </td>  
                    <td className='table_underline' style={{textAlign: 'center'}}>
                      <a href='#' onClick={(e) => {
                        e.preventDefault();
                        updateVisible(item.cateno, item.visible);
                      }}>
                        <img src={item.visible === 'Y' ? show_img : hide_img} 
                             title={item.visible === 'Y' ? '메뉴에 출력됨' : '메뉴에 출력안됨'} 
                             className='icon' />
                      </a>
                      <a href='#' onClick={(e) => { e.preventDefault(); seqno_update(item.cateno, 'increase'); }}>
                        <img src={increase_img} title='출력 우선순위 낮춤' className='icon' />
                      </a>    
                      <a href='#' onClick={(e) => { e.preventDefault(); seqno_update(item.cateno, 'decrease'); }}>
                        <img src={decrease_img} title='출력 우선순위 높임' className='icon' />
                      </a>               
                      <a href='#' onClick={(e) => { e.preventDefault(); read_for_update(item.cateno); }}><img src={update_img} className='icon' title='수정' /></a>
                      <a href='#' onClick={(e) => { e.preventDefault(); read_for_delete(item.cateno); }}><img src={delete_img} className='icon' title='삭제' /></a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888', fontWeight: 'bold' }}>
                    등록된 카테고리가 없거나 데이터를 불러오는 중입니다.
                  </td>
                </tr>
              )
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Cate;