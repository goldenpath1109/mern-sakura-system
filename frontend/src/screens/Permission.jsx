import {Link} from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import "./style.css";

const Admin = () => {

    const [perms, setPerms] = useState("");

    const data = {email: perms}
    const [users, setUsers] = useState([]);

    const permission = () => {
        if(perms === "") return ;
        axios.post("/api/users/permission", data)
        .then(res => {
            if(res.data === "success") alert("許可されました。");
            window.location.reload(false);
        })
    }

    const exportToCsv = (data) => {
        // Headers for each column
        let headers = ['name,email,password'];
        // Convert users data to a csv
        let usersCsv = data.reduce((acc, user) => {
          const { name, email, password } = user;
          acc.push([name, email, password].join(','))
          return acc
        }, [])
        downloadFile({
          data: [...headers, ...usersCsv].join('\n'),
          fileName: 'users.csv',
          fileType: 'text/csv',
        })
    }

    const downloadFile = ({ data, fileName, fileType }) => {
        const blob = new Blob([data], { type: fileType })
        const a = document.createElement('a')
        a.download = fileName
        a.href = window.URL.createObjectURL(blob)
        const clickEvt = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
        })
        a.dispatchEvent(clickEvt)
        a.remove()
      }

    useEffect(() => {

        axios.post("/api/users/getUsers", {})
        .then(res => {
            console.log(res.data.resData);
            setUsers(res.data.resData);
            exportToCsv(res.data.resData);
        })
      }, []);

    return (
        <div className="Admin-V">
            {/* <div className="Admin-inside">
                <div className="Admin-input" ><input value={perms} onChange={(e) => setPerms(e.target.value)}/></div>
                <div className="permissionBtn" onClick={permission}>許可する</div>
                <Link to="/" className="permission-backBtn" style={{  textDecoration: "none"}}><div>戻る</div></Link>
            </div> */}

            <div className='Admin-users'>
                <table className='admin-table'>
                    <thead>
                        <tr>
                            <th style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>番号</div></th>
                            <th style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>名前</div></th>
                            <th style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>メールアドレス</div></th>
                            <th style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>パスワード</div></th>
                            {/* <th style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>許可状況</div></th> */}
                        </tr>
                    </thead>

                    <tbody>
                        {
                            users.map((item, key) => {
                                return <tr key = {key}>
                                    <td style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>{key + 1}</div></td>
                                    <td style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>{item.name}</div></td>
                                    <td style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>{item.email}</div></td>
                                    <td style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>{item.password}</div></td>
                                    {/* <td style={{border: "1px solid gainsboro"}}><div style={{display: "flex", justifyContent: "center", alignItem: "center"}}>{item.status === "1"?"許可済み":"許可なし"}</div></td> */}
                                </tr>
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Admin;