const express = require('express')
const app = express()
const router  = express.Router()
const users = require('./users.json')
const crypto = require('crypto')
app.use(router)

let count_checkUser = 0
const checkUser = (token,count_checkUser)=>{
    if(count_checkUser<=5){
        if(token===users.admin.token){
            return 'admin'
        }
        return 'user'
    }
    return false
}

router.get('/api/:id',(req,res)=>{
    const hard_codedId='78'
    const id = req.params.id
    const Token = req.headers.cookie 
    ? req.headers.cookie.split('; ').find(row => row.startsWith('Token=')).split('=')[1] 
    : crypto.createHash('sha256').update(hard_codedId).digest('hex');

    if(!(Token && Token.length===64)){
        return res.status(401).json({'message':'Unauthorized'})
    }

    userAccount=checkUser(Token,count_checkUser)
    if(userAccount && userAccount!=='admin'){
        count_checkUser++
    }else if(!userAccount){
        setTimeout(() => {
            count_checkUser=0
        },1000*60*3);

        res.status(500).json({'message':'Timeout'})

        setTimeout(() => {
            count_checkUser=0
        },15*1000);

    }
    if(userAccount==='admin'){
        const result = Object.values(users).find(item => item.id===id);
        if(result){
            return res.status(200).json({
                'user':result
            })
        }else{
            return res.status(404).json({'message':'No Users Found!'})
        }
    }

    res.status(401).json({'message':'Unauthorized'})
})

app.listen(1337)
