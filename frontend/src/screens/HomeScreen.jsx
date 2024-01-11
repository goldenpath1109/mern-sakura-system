import LoginScreen from '../screens/LoginScreen';
import Maintool from './Maintool';
import Admin from './Admin';
import { useSelector} from 'react-redux';

const HomeScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <>
      {userInfo ? userInfo.email === "uprove.111@gmail.com"? <Admin />: <Maintool />:<LoginScreen />}
    </>
  );
};
export default HomeScreen;
