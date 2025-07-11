import axios from 'axios'
import { showAlert } from './alerts';

// type where its 'data' or 'password'
export const updateSettings = async(data,type)=>{
    const url = type==='data'?'http://localhost:3000/api/v1/users/updateMe':'http://localhost:3000/api/v1/users/updateMyPassword'
   try{
    const response = await axios({
        method:'PATCH',
        url:url,
        data:data,
    });
    if(response.data.status === 'success'){
      showAlert('success',`${type==='data'?'user data ':'password '}data has been updated successfully!`)
    }
   }catch(err){
    showAlert('error',err.response.data.message)
   }
} 