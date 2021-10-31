import React, {useState, useRef} from 'react'
import './App.css';
import axios from 'axios'
import {Image} from "react-image-progressive-loading"

const instance = axios.create({
  baseURL: "http://192.168.43.81:5000/api/file"
})

const image1 = require("./images/upload.jpeg").default
const image2 = require("./images/icon-file.jpeg").default

function App() {
  const [files, setFiles] = useState([])
  const [fileUploading, setFileUploading] = useState(null)

  const inputFile = useRef()

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    console.log(file)

    if (file) {
      const formData = new FormData()

      // creating a new file representation
      const fileToUpload = {
        name: file.name.split('.')[0],
        size: file.size,
        percentage: 0
      }

      setFileUploading(fileToUpload)

      // building of form data
      formData.append("image", file)

      // progressive loading
      const options = {
        onUploadProgress: (progressEvent) => {
          const {loaded, total} = progressEvent

          const percentage = Math.floor((loaded * 100)/total)

          console.log(`${loaded}B on ${total}B | percentage = ${percentage}`)

          setFileUploading(state => ({...state, percentage}))
        }
      }
  
      try {
        const response = await instance.post("/upload", formData, options)
        
        const filesClone = [...files]
        let id = 1

        if (filesClone.length > 0)
          id = filesClone[0].id + 1

        filesClone.unshift({...fileToUpload, id})
        console.log(filesClone)

        setFileUploading(null)
        setFiles(filesClone)
        console.log(response.data)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleClickFile = () => {
    if (!fileUploading)
      inputFile.current.click()
  }

  return (
    <div className="App">
      <h3 className="header-title">Images Uploader</h3>

      <div className="trigger" onClick={handleClickFile}>
        <Image image={image1} alt="upload" className="upload-img" blur={true} />

        <span>Browse a file</span>
      </div>
      <input 
        ref={inputFile} 
        type="file" 
        hidden 
        onChange={handleFileChange}
        accept="image/*"
      />

      <section className="files">
        {
          fileUploading && <UploadingFile file={fileUploading} />
        }

        <div className={`uploaded-files ${!fileUploading && "uploaded-files--processing"}`}>
          {
            files.map(file => (
              <UploadedFile key={file.id} name={file.name} size={file.size} />
            ))
          } 
        </div>
      </section>
    </div>
  );
}

const UploadingFile = ({file}) => {
  const {name, percentage} = file

  return (
    <article className="file-uploading">
      <Image image={image2} alt="file" className="file-img" blur={true} />

      <div className="file-uploading--info">
        <div className="info">
          <span>{name.length > 6 ? name.substr(0, 6) + "...":name} <i className="bi bi-dot"></i> Uploading</span>
          <span>{percentage}%</span>
        </div>

        <span className="progress-bar">
          <span style={{width: `${percentage}%`}}></span>
        </span>
      </div>
    </article>
  )
} 

const UploadedFile = ({name, size}) => {
  const formatSize = (size) => {
    if (size < 1000) {
      return size + "B"
    } else if (size > 1000 && size < 1000000) {
      return Math.floor(size/100)/10 + "KB"
    } else {
      return Math.floor(size/100000)/10 + "MB"
    }
  }

  return (
    <article className="file-uploading">
      <img src={require('./images/icon-file.jpeg').default} alt="file" />

      <div className="file-uploading--info">
        <div className="info">
          <span>{name.length > 16 ? name.substr(0, 16) + "...":name}</span>
        </div>

        <span className="file-size">{formatSize(size)}</span>
      </div>

      <i className="bi bi-check file-uploaded"></i>
    </article>
  )
}

export default App;
