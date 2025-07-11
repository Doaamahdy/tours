import '@babel/polyfill';
import axios from 'axios';
import {showAlert} from './alerts'
export const login = async (email, password) => {
  try {
    const response = await axios({
      method: "POST",
      url: "http://localhost:3000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });
    if(response.data.status === 'success'){
        showAlert('success',"Logges in successfully")
        setTimeout(()=>{
            window.location.assign('/')
        },1500)
    }
  } catch (err) {
    showAlert('error',err.response.data.message)
  }
};

export const logout = async() =>{
  try{
    const response = await axios({
      method:'GET',
      url:'http://localhost:3000/api/v1/users/logout',
    })
    if(response.data.status === 'success'){
      // set it to true it means forces the reloading from the server not from the browser cache
      location.reload(true);
    }
  
  }catch(err){
    showAlert('error','Error logging out! Try again.')
  }
}
