// const { table } = require("console")
// const { url } = require("inspector")

const dropZone=document.querySelector(".drop-zone")
const fileinput=document.querySelector("#fileinput")
const browseBtn=document.querySelector(".browseBtn")

const bgprogress=document.querySelector(".bg-progress")
const percentdiv=document.querySelector("#percent")
const progressbar=document.querySelector(".progress-bar")
const progresscontainer=document.querySelector(".progress-container")
const fileurlinput=document.querySelector("#fileurl")
const sharingcontainer=document.querySelector(".sharing-container")
const copybtn=document.querySelector("#copybtn")
const toast=document.querySelector(".toast")

const emailform=document.querySelector("#email-form")
const maxAllowedSize = 100 * 1024 * 1024;

const host = "https://filesharenjs.herokuapp.com/";
const uploadurl=`${host}api/files`;
const emailurl=`${host}api/files/send`

dropZone.addEventListener("dragover",(e)=>
{
    e.preventDefault()
    // console.log("dragging")
    if(!dropZone.classList.contains("dragged"))
    {
        dropZone.classList.add("dragged")
    }
    
})

dropZone.addEventListener("dragleave",()=>
{
    dropZone.classList.remove("dragged")
})


dropZone.addEventListener("drop",(e)=>
{
    e.preventDefault()
    dropZone.classList.remove("dragged")
    const files=e.dataTransfer.files
    // console.table(files);
    console.log(`file: ${files}`);
    if(files.length==0)showtoast("No file Selected")
    else if(files.length==1)
    {
        if(files[0].size<maxAllowedSize)
        {
            fileinput.files=files
            uploadFile()
        }
        else showtoast("File Size Limit is 100MB")
    }
    else showtoast("Cannot Upload Multiple Files")
})

fileinput.addEventListener("change",()=>
{
    uploadFile();
})

copybtn.addEventListener("click",()=>{
    fileurlinput.select();
    document.execCommand("copy");
    showtoast("Copied to Clipboard")
})

browseBtn.addEventListener("click",()=>
{
    fileinput.click()
})

const uploadFile=()=>
{
    
    const file=fileinput.files[0]
    if(file.size>maxAllowedSize)
    {
        showtoast("File Size Limit is 100MB")
        return;
    }
    progresscontainer.style.display=`block`;
    const formData=new FormData()
    formData.append("myfile",file)

    const xhr=new XMLHttpRequest();

    xhr.upload.onprogress= updateprogress;

    xhr.upload.onerror=()=>
    {
        fileinput.value="";
        showtoast(`Error in uploading : ${xhr.statusText}`)
        progresscontainer.style.display="none";
    }

    xhr.onreadystatechange = ()=>
    {
        console.log(xhr.readyState)
        if(xhr.readyState===XMLHttpRequest.DONE)
        {
            console.log(xhr.response)
            onuploadsuccess(xhr.responseText)
        }
    }

    
    xhr.open("POST",uploadurl)
    xhr.send(formData)
}

const updateprogress = (e)=>
{
    const percent=Math.round((e.loaded/e.total)*100);
    console.log(e)
    bgprogress.style.width=`${percent}%`
    percentdiv.innerText=`${percent}%`;
    progressbar.style.transform=`scaleX(${percent/100})`
}

// const updateprogress1 = ()=>
// {
//     // const percent=Math.round((e.loaded/e.total)*100);
//     // console.log(e)
//     for(var percent=0;percent<=100;percent++)
//     {
//         bgprogress.style.width=`${percent}%`
//         percentdiv.innerText=`${percent}%`;
//     }
// }
// updateprogress1();

const onuploadsuccess =(res)=>
{
    // console.log(file);
    fileinput.value="";
    emailform[2].removeAttribute("disabled")
    progresscontainer.style.display=`none`;
    sharingcontainer.style.display=`block`;
    const {file:url}=JSON.parse(res)
    fileurlinput.value=url;
}

emailform.addEventListener("submit",(e)=>
{
    e.preventDefault();
    console.log("submit form");

    const url=fileurlinput.value
    const formData={
        uuid: url.split("/").splice(-1,1)[0],
        emailto:emailform.elements["to-email"].value,
        emailfrom:emailform.elements["from-email"].value,
    }
    emailform.setAttribute("disabled","true")
    console.log(formData)

    fetch(emailurl,{
        method:"POST",
        headers:{
            "content-Type":"application/json"
        },
        body: JSON.stringify(formData),
    })
    .then((res)=>res.json())
    .then(({success})=>{
        // console.log(data)
        if(success)
        {
            sharingcontainer.style.display="none";
            showtoast("Email Sent Successfully")
        }
    })

})

let toasttimer;

const showtoast=(msg)=>
{
    toast.innerText=msg;
    toast.style.transform="translate(-50%,0)"
    clearTimeout(toasttimer)
    toasttimer=setTimeout(()=>
    {
        toast.style.transform="translate(-50%,60px)"
    },2000)
}
