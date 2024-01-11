import { useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';

import "./style.css";

const Admin = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const permission = () => {
        if(userInfo.email === 'uprove.111@gmail.com') navigate('/permission');
    }

    const tool = () => {
        if(userInfo.email === 'uprove.111@gmail.com') navigate('/tool');
    }
    
    return (
        <div className="Admin">
            <div className="Admin-inside">
                <div className="Admin-div1" onClick={permission}>
                    <p style={{fontSize: "25px"}}>管理者ページ</p>
                </div>

                <div className="Admin-div2" onClick={tool}>
                    <p style={{fontSize: "25px"}}>ツールページへ</p>
                </div>
            </div>
        </div>
    );
}

export default Admin;