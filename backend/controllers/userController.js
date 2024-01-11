import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import Permission from '../models/permissionModel.js'
import generateToken from '../utils/generateToken.js';
import puppeteer from "puppeteer";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && password === user.password) {
      // const per = await Permission.findOne({email});
      // if(per || email === "uprove.111@gmail.com"){
        generateToken(res, user._id);
        
        res.json({
          _id: user._id,
          name: user.name,
          email: user.email
        });
      // }
      // else {
      //   res.status(401);
      //   throw new Error('利用許可が必要です。');
      // }
  } else {
    res.status(401);
    throw new Error('登録した後メールアドレスとパスワードを正確に入力してください。');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) { 
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

const permission = asyncHandler(async (req, res) => {
  const {email} = req.body;

  const user = await Permission.findOne({email})
  if(user){;}
  else { await Permission.create({email}); }

  res.json("success");
});

const getUsers = asyncHandler(async (req, res) => {

  const users = await User.find();
  const per = await Permission.find();
  let resData = [];
  for(let i = 0 ; i < users.length; i++) {
    resData[i] = {name: "", email: "", password: "", status: "0"}
    resData[i].name = users[i].name;
    resData[i].email = users[i].email;
    resData[i].password = users[i].password;
    if(users[i].name === "admin") resData[i].status = "1";
    for(let j = 0 ; j < per.length; j++) if(users[i].email === per[j].email) {
      resData[i].status = "1"; break;
    }
  }

  res.json({resData: resData});
});

const search = asyncHandler(async(req, res) => {
  let mercari_url = "https://jp.mercari.com/search?";
  let old_rakuma_url = "https://fril.jp/s?";
  let old_yahoo;
  let yahoo;
  let moba;
  let yodoba;
  let bicamerca;
  let keepa;
  let oldyahsign = 0;
  let yahsign = 0;
  if(req.body.keyword !== "") {
    mercari_url += "keyword=" + req.body.keyword;
    old_rakuma_url += "query=" + req.body.keyword;
    old_yahoo = "https://paypayfleamarket.yahoo.co.jp/search/"+req.body.keyword;
    yahoo = "https://auctions.yahoo.co.jp/search/search?p="+req.body.keyword;
    moba = "https://www.mbok.jp/_l?at=all&sel-cat=&c=&cp1="+req.body.minprice+"&cp2="+req.body.maxprice+"&ic=0&ss=&_CODE=%82%A0&vt=0&r=fl&m=1&o=&fc=&ls_exec=1&mem=1&q=" + req.body.keyword;
    yodoba = "https://www.yodobashi.com/?word=GUCCI";
    bicamerca = "https://www.biccamera.com/bc/category/?q=" + req.body.keyword;
    keepa = "https://keepa.com/#!search/1-" + req.body.keyword;
  }
  if(req.body.state1 === 0) {
    mercari_url += "&status=on_sale%2Csold_out%7Ctrading";
    bicamerca += "&sold_out_tp2=2&sold_out_tp1=1";
  }
  if(req.body.state1 === 1) {
    mercari_url += "&status=on_sale";
    old_rakuma_url += "&transaction=selling";
    old_yahoo += "?open=1";
    moba += "&open_only=1&_SRC=soldcheck_on";
    yodoba += "&discontinued=false";
    bicamerca += "&sold_out_tp1=1&sold_out_tp2=2";
    oldyahsign = 1;
  }
  if(req.body.state1 === 2) {
    mercari_url += "&status=sold_out%7Ctrading";
    old_rakuma_url += "&transaction=soldout";
    old_yahoo += "?sold=1";
    moba += "&open_only=0&_SRC=soldcheck_off"
    bicamerca += "&sold_out_tp2=2";
    oldyahsign = 1;
  }
  let flag = 0;
  for(let i = 0 ; i < 5; i++) if(req.body.state2[i] === 1) flag = 1;
  if(flag) {
    mercari_url += "&item_condition_id=";
    if(oldyahsign) old_yahoo +="&conditions=";
    else old_yahoo +="?conditions=";
    yahoo += "&istatus=";
    oldyahsign = 1;
    yahsign = 1;
  }
  flag = 0;
  if(req.body.state2[0] === 1) {
    mercari_url += "1"; 
    old_rakuma_url += "&status=new";
    old_yahoo += "NEW"
    yahoo += "1";
    moba += "&ic=1";
    flag = 1;
  }
  if(req.body.state2[1] === 1) {
    if(flag) {
      mercari_url += "%2C2";
      old_yahoo += "%2CUSED10";
      yahoo += "%2C3";
    }
    else {
      mercari_url += "2"; 
      old_yahoo += "USED10";
      yahoo += "3";
    }
    moba += "&ic=2";
    flag = 1;
  }
  if(req.body.state2[2] === 1) {
    if(flag) {
      mercari_url += "%2C3";
      old_yahoo += "%2CUSED20";
      yahoo += "%2C4";
    }
    else {
      mercari_url += "3"; 
      old_yahoo += "USED20";
      yahoo += "4";
    }
    moba += "&ic=2";
    flag = 1;
  }
  if(req.body.state2[3] === 1) {
    if(flag) {
      mercari_url += "%2C4";
      old_yahoo += "%2CUSED40";
      yahoo += "%2C5";
    }
    else {
      mercari_url += "4";
      old_yahoo += "USED40";
      yahoo += "5";
    }
    moba += "&ic=2";
    flag = 1;
  }
  if(req.body.state2[4] === 1) {
    if(flag) {
      mercari_url += "%2C5";
      old_yahoo += "%2CUSED60";
      yahoo += "%2C6";
    }
    else {
      mercari_url += "5"; 
      old_yahoo += "USED60";
      yahoo += "6";
    }
    moba += "&ic=2";
    flag = 1;
  }
  if(req.body.order === 0) {
    mercari_url += "&sort=score&order=desc";
    old_rakuma_url += "&order=desc&sort=relevance";
    if(oldyahsign) old_yahoo += "&sort=ranking&order=asc";
    else old_yahoo += "?sort=ranking&order=asc";
    oldyahsign = 1;
  }
  if(req.body.order === 1) {
    mercari_url += "&order=asc&sort=price";
    old_rakuma_url += "&order=asc&sort=sell_price";
    if(oldyahsign) old_yahoo += "&sort=price&order=asc";
    else old_yahoo += "?sort=price&order=asc";
    yahoo += "&s1=tbids&o1=a";
    moba += "&o=1";
    yodoba += "&sorttyp=SELL_PRICE_ASC";
    bicamerca += "&sort=02";
  }
  if(req.body.order === 2) {
    mercari_url += "&sort=price&order=desc";
    old_rakuma_url += "&order=desc&sort=sell_price";
    if(oldyahsign) old_yahoo += "&sort=price&order=desc";
    else old_yahoo += "?sort=price&order=desc";
    yahoo += "&s1=tbids&o1=d";
    moba += "&o=2";
    yodoba += "&sorttyp=SELL_PRICE_DESC";
    bicamerca += "&sort=03";
  }
  if(req.body.order === 3) {
    mercari_url += "&order=desc&sort=created_time";
    old_rakuma_url += "&order=desc&sort=created_at";
    if(oldyahsign) old_yahoo += "&sort=openTime&order=desc";
    else old_yahoo += "?sort=openTime&order=desc";
    yahoo += "&s1=new&o1=d";
    moba += "&o=8";
    yodoba += "&sorttyp=NEW_ARRIVAL_RANKING";
    bicamerca += "&sort=01";
  }

  mercari_url += "&price_min="+req.body.minprice+"&price_max="+req.body.maxprice;
  old_rakuma_url += "&min="+req.body.minprice+"&max="+req.body.maxprice;
  if(oldyahsign) old_yahoo += "&minPrice="+req.body.minprice+"&maxPrice="+req.body.maxprice;
  else old_yahoo += "minPrice="+req.body.minprice+"&maxPrice="+req.body.maxprice;
  yahoo +="&min="+req.body.minprice+"&max="+req.body.maxprice+"&price_type=currentprice";
  yodoba += "&lower="+req.body.minprice+"&upper="+req.body.maxprice;
  bicamerca += "&max="+req.body.maxprice+"&min="+req.body.minprice+"";
  
  // console.log(mercari_url, old_rakuma_url);
  let result_name = [[],[],[],[],[],[],[],[]];
  let result_price = [[],[],[],[],[],[],[],[]];
  let result_url = [[],[],[],[],[],[],[],[]];
  let result_image = [[],[],[],[],[],[],[],[]];

  const browser = await puppeteer.launch({
    "headless": false,
    "args": ["--fast-start", "--disable-extensions", "--no-sandbox","--lang=ja-JP,ja"],
    "ignoreHTTPSErrors": true,
  });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 
    'Accept-Language': 'ja' 
  });
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  while(1) {
    try {
      await page.goto(mercari_url);
      break;
    } catch (error) {
      console.log("error in mercari_url");
      continue;
    }
  }
  let products;
  let products_price;
  let url;
  let imageurl;
  let fg = 0;
  
  while(fg < 100) {
    try {
      fg++;
      products =  await page.$$eval('.itemName__a6f874a2', elements=> elements.map(item=>item.textContent));
      products_price =  await page.$$eval('.number__6b270ca7', elements=> elements.map(item=>item.textContent));
      url = await page.$$eval('[data-testid="thumbnail-link"]', anchors => [].map.call(anchors, a => a.href));
      imageurl = await page.$$eval("picture > img", anchors => [].map.call(anchors, img => img.src));
      // if(products.length === 0 && products_price.length === 0 && url.length === 0 && imageurl.length === 0) break;
      if(products.length === 0 || products_price.length === 0 || url.length === 0 || imageurl.length === 0) continue;
      break;
    }
    catch(error) {
      fg++;
      console.log(error);
    }
  }
  result_name[0].push(products);
  result_price[0].push(products_price);
  result_url[0].push(url);
  result_image[0].push(imageurl);

  while(1) {
    try {
      await page.goto(old_rakuma_url);
      break;
    } catch (error) {
      console.log("error in old_rakuma_url");
      continue;
    }
  }

  fg = 0;
  let no = "";
  while(fg < 100) {
    try {
      fg++;
      products =  await page.$$eval('.link_search_title > span', elements=> elements.map(item=>item.textContent));
      products_price =  await page.$$eval('.item-box__item-price > span', elements=> elements.map(item=>item.textContent));
      url = await page.$$eval('.link_search_title', anchors => [].map.call(anchors, a => a.href));
      imageurl = await page.$$eval(".img-responsive", anchors => [].map.call(anchors, img => img.src));
      // if(products.length === 0 && products_price.length === 0 && url.length === 0 && imageurl.length === 0) break;
      if(products.length === 0 || products_price.length === 0 || url.length === 0 || imageurl.length === 0) continue;
      break;
    }//*[@id="rec"]/div[1]/h3
    catch(error) {
      fg++;
      console.log(error);
    }
  }

  result_name[1].push(products);
  result_price[1].push(products_price);
  result_url[1].push(url);
  result_image[1].push(imageurl);

  while(1) {
    try {
      await page.goto(old_yahoo);
      await page.goto(old_yahoo);
      break;
    } catch (error) {
      console.log("error in old_yahoo_url");
      continue;
    }
  }

  fg = 0;
  while(fg < 100) {
    try {
      fg++;
      const temp = await page.$x('//*[@id="__next"]/div/div[1]/div/div/main/div/div/div[2]/div[2]/div[1]/div/p/span');
      if(temp.length > 0) no = await page.evaluate((element) => element.textContent, temp[0]);

      products_price =  await page.$$eval('.sc-fad0d81d-3', elements=> elements.map(item=>item.textContent));
      url = await page.$$eval('.sc-fad0d81d-0', anchors => [].map.call(anchors, a => a.href));
      imageurl = await page.$$eval(".sc-fad0d81d-1", anchors => [].map.call(anchors, img => img.src));
      // if(products_price.length === 0 && url.length === 0 && imageurl.length === 0) break;
      if(products_price.length === 0 || url.length === 0 || imageurl.length === 0) continue;
      break;
    }
    catch(error) {
      fg++;
      console.log(error);
    }
  }
  
  if(no.includes("お探しの条件に一致する商品")) {
    result_price[2].push([]);
    result_url[2].push([]);
    result_image[2].push([]);
  }
  else { 
    result_price[2].push(products_price);
    result_url[2].push(url);
    result_image[2].push(imageurl);
  }

  while(1) {
    try {
      await page.goto(yahoo);
      await page.goto(yahoo);
      break;
    } catch (error) {
      console.log("error in yahoo");
      continue;
    }
  }

  fg = 0;
  while(fg < 100) {
    try {
      fg++;
      products =  await page.$$eval('.Product__titleLink', elements=> elements.map(item=>item.textContent));
      products_price =  await page.$$eval('.Product__priceValue', elements=> elements.map(item=>item.textContent));
      url = await page.$$eval('.Product__titleLink', anchors => [].map.call(anchors, a => a.href));
      imageurl = await page.$$eval(".Product__imageData", anchors => [].map.call(anchors, img => img.src));
      // if(products.length === 0 && products_price.length === 0 && url.length === 0 && imageurl.length === 0) break;
      if(products.length === 0 || products_price.length === 0 || url.length === 0 || imageurl.length === 0) continue;
      break;
    }
    catch(error) {
      fg++;
      console.log(error);
    }
  }
  result_name[3].push(products);
  result_price[3].push(products_price);
  result_url[3].push(url);
  result_image[3].push(imageurl);
  console.log(moba);
  while(1) {
    try {
      await page.goto(moba);
      await page.goto(moba);
      console.log(moba);
      break;
    } catch (error) {
      console.log("error in moba");
      continue;
    }
  }

  fg = 0;
  while(fg < 100) {
    try {
      fg++;
      products =  await page.$$eval('.txt_pimp', elements=> elements.map(item=>item.textContent));
      products_price =  await page.$$eval('[itemprop="lowPrice"]', elements=> elements.map(item=>item.textContent));
      url = await page.$$eval('.item-thumb', anchors => [].map.call(anchors, a => a.href));
      imageurl = await page.$$eval(".item-thumb > img", anchors => [].map.call(anchors, img => img.src));
      // if(products.length === 0 && products_price.length === 0 && url.length === 0 && imageurl.length === 0) break;
      if(products.length === 0 || products_price.length === 0 || url.length === 0 || imageurl.length === 0) continue;
      break;
    }
    catch(error) {
      fg++;
      console.log(error);
    }
  }
  result_name[4].push(products);
  result_price[4].push(products_price);
  result_url[4].push(url);
  result_image[4].push(imageurl);

  await browser.close();

  res.json({name: result_name, price: result_price, url: result_url, imageurl: result_image});
});

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  permission,
  search,
  getUsers,
};
