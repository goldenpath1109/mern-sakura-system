import { useState } from "react";
import { useSelector} from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MDBSpinner } from 'mdb-react-ui-kit';
import axios from 'axios';

import "bootstrap/dist/css/bootstrap.min.css";
import './style.css';

const Maintool = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  const [search_val, setSearchVal] = useState("");
  const [state, Setstatus] = useState(0);
  const [checked, Setchecked] = useState([0, 0, 0, 0, 0]);
  const [order, Setorder] = useState(0);
  const [turn, Setturn] = useState(0);
  const [product, Setproduct] = useState([]);
  const [minprice, Setminprice] = useState(300);
  const [maxprice, Setmaxprice] = useState(9999999);
  const [current_store, Setcurrent_store] = useState([1,0,0,0,0]);

  const Start_search = () => {
    if(search_val === "") {
      alert("キーワードを入力してください。");
      return ;
    }
    if(minprice > maxprice) {
      alert("最小金額は最大金額より小さくなければなりません。");
      return ;
    }
    setSearchVal("");
    Setstatus(0);
    Setorder(0);
    Setturn(1);
    Setminprice(300);
    Setmaxprice(9999999);

    const data = {
      keyword: search_val,
      state1: state,
      state2: checked,
      order: order,
      minprice: minprice,
      maxprice: maxprice,
    }
    axios.post("/api/users/search", data)
    .then(res => {
        console.log(res.data);
        let resultTmp = [];
        console.log(res.data.price[1][0].length);
        for(let i = 0 ; i < 5; i++) {
          let tmp = {name: [], price: [], url: [], image: []};
          for(let j = 0 ; j < Math.min(50, (i === 1?res.data.url[i][0].length / 2:res.data.url[i][0].length )); j++) {
            if(res.data.name[i][j] !== "" && i !== 2) tmp.name[j] = res.data.name[i][0][j];
            if(res.data.price[i][j] !== "" && i !== 1) tmp.price[j] = res.data.price[i][0][j];
            if(res.data.url[i][j] !== "") tmp.url[j] = res.data.url[i][0][j];
            if(res.data.imageurl[i][j] !== "") tmp.image[j] = res.data.imageurl[i][0][j];
            if(i === 2) tmp.name[j] = "商品名なし";
            if(i === 1) tmp.price[j] = res.data.price[i][0][(j+1)*2-1]+"円";
            if(i === 0 || i === 4) tmp.price[j] += "円";
          }
          resultTmp.push(tmp);
        }
        Setproduct(...[resultTmp]);
        Setturn(2);
        console.log(resultTmp);
      })
  }

  const handleChange = (selected_value) => {
    let tmp = checked;
    tmp[selected_value - 1] ^= 1;
    Setchecked([...tmp]);
  };


  return (
    <div className="maintool">
      {
      turn === 0? 
      <div className="search_condition">
        <div className="search">
            <input type="text" value={search_val} onChange={(e) => setSearchVal(e.target.value)}/>
        </div>
        <div className="searchBtn">
            <div onClick={Start_search}>検索する</div>
        </div>

        <div className="sale">
            <div style={state === 0?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setstatus(0)}>すべて</div>
            <div style={state === 1?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setstatus(1)}>販売中</div>
            <div style={state === 2?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setstatus(2)}>売り切れ</div>
        </div>

        <div className="price_range">
            <p className="price_rangeLavel" style={{fontWeight: "bold",fontSize: "20px", marginTop: '20px'}}>最小金額と最大金額</p>
            <div className="price_range_input">
              <input type="number" min={300} max={9999999} value={minprice} onChange={(e) => Setminprice(e.target.value)}/>
              <input type="number" min={300} max={9999999} value={maxprice} onChange={(e) => Setmaxprice(e.target.value)}/>
            </div>
        </div>

        <div className="status">
            <div className="status_div" style={{fontWeight: "bold",fontSize: "20px", marginTop: '20px'}}>商品の状況</div>
            <div className="status_div">
              <input type="checkbox" onChange={() => handleChange(1)} />
              <span>新品、未使用</span>
            </div>
            <div className="status_div">
              <input type="checkbox" onChange={() => handleChange(2)}/>
              <span>未使用に近い</span>
            </div>
            <div className="status_div">
              <input type="checkbox" onChange={() => handleChange(3)} />
              <span>目立った傷や汚れなし</span>
            </div>
            <div className="status_div">
              <input type="checkbox" onChange={() => handleChange(4)}/>
              <span>やや傷や汚れあり</span>
            </div>
            <div className="status_div">
              <input type="checkbox" onChange={() => handleChange(5)}/>
              <span>傷や汚れあり</span>
            </div>
        </div>

        <div className="order">
            <div className="order_label"  style={{fontWeight: "bold",fontSize: "20px", marginTop: '30px'}}>並び順</div>
            <div className="order_div">
                <div style={order === 0?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setorder(0)}>おすすめ順</div>
                <div style={order === 1?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setorder(1)}>安い順</div>
                <div style={order === 2?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setorder(2)}>高い順</div>
                <div style={order === 3?{backgroundColor: "grey", color: "white"}:{}} onClick={() => Setorder(3)}>新しい順</div>
            </div>
        </div>

        {userInfo.email === "uprove.111@gmail.com"?
          <div className="searchBtn">
            <div onClick={() => {navigate('/');}}>戻る</div>
          </div>:"" }
      </div>:
       turn === 1?
       <div className="loading">
         <MDBSpinner className='me-2' style={{ width: '3rem', height: '3rem' }}>
           <span className='visually-hidden'>Loading...</span>
         </MDBSpinner>
 
         <MDBSpinner grow style={{ width: '3rem', height: '3rem' }}>
           <span className='visually-hidden'>Loading...</span>
         </MDBSpinner>
         <span style = {{margin: "0 0 10px 30px"}}>起動まで数分かかる場合がございます。 しばらくお待ちください…</span>
       </div>:
       <div className="search_result">
         <div className="store_name">
             <span style={current_store[0] === 1? {color: "white", backgroundColor: "grey"}: {}} onClick={() => Setcurrent_store([1,0,0,0,0])}>メルカリ</span>
             <span style={current_store[1] === 1? {color: "white", backgroundColor: "grey"}: {}} onClick={() => Setcurrent_store([0,1,0,0,0])}>フリル</span>
             <span style={current_store[2] === 1? {color: "white", backgroundColor: "grey"}: {}} onClick={() => Setcurrent_store([0,0,1,0,0])}>Yahoo!フリマ</span>
             <span style={current_store[3] === 1? {color: "white", backgroundColor: "grey"}: {}} onClick={() => Setcurrent_store([0,0,0,1,0])}>ヤフオク</span>
         </div>
 
         <div className="product_content">
           {
           current_store.map((store_num, key) => {
               if(store_num === 0) return ;
               return product[key].price.map((pt, kk) => {
                 return <div className="product" key={kk}>
                   <a href={product[key].url[kk]} target="_blank" >
                     <div className="product_image">
                         <img src = {product[key].image[kk]} style={{width: "100%", height: "100%"}}/>
                     </div>
                     <div className="product_name">
                       <p>{product[key].name[kk]}</p>
                     </div>
                     <div className="product_price">
                       <p>{pt}</p>
                     </div>
                   </a>
                 </div>
               })
           })
           }
         </div> 
       </div>
       }
    </div>
    
  );
}

export default Maintool;