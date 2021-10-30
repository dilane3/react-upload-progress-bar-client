import React, {useState, useRef, useCallback} from 'react'
import './App.css';
import axios from 'axios'

const instance = axios.create({
  baseURL: "http://localhost:5000/api/file"
})

function App() {
  const [files, setFiles] = useState([])
  const [filesUploading, setFilesUploading] = useState([])

  const inputFile = useRef()

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    console.log(file)

    if (file) {
      const formData = new FormData()
      const filesUploadingClone = [...filesUploading]

      // adding file in the state
      let id = new Date().getTime()

      const fileToUpload = {
        id,
        name: file.name.split('.')[0],
        size: file.size
      }

      filesUploadingClone.push(fileToUpload)
      setFilesUploading(filesUploadingClone)

      // building of form data
      formData.append("image", file)
      formData.append("id", id)
  
      try {
        const response = await instance.post("/upload", formData)
        
        const fileUploaded = response.data
        const index = filesUploadingClone.findIndex(file => file.id === Number(fileUploaded.id))

        console.log(index)
        console.log(fileUploaded.id)
        console.log(filesUploading)

        if (index > -1) {
          const filesClone = [...files]

          filesClone.push({...filesUploadingClone[index]})
          filesUploadingClone.splice(index, 1)

          setFiles(filesClone)
          setFilesUploading(filesUploadingClone)
        }
        console.log(response.data)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <div className="App">
      <h3 className="header-title">Images Uploader</h3>

      <div className="trigger" onClick={() => inputFile.current.click()}>
        <img src={require('./images/upload.jpeg').default} alt="upload" />

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
          filesUploading.map(file => (
            <UploadingFile key={file.id} name={file.name} />
          ))
        }

        <div className="uploaded-files">
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

const UploadingFile = ({name}) => {
  return (
    <article className="file-uploading">
      <img src={require('./images/icon-file.jpeg').default} alt="file" />

      <div className="file-uploading--info">
        <div className="info">
          <span>{name.length > 6 ? name.substr(0, 6) + "...":name} <i className="bi bi-dot"></i> Uploading</span>
          <span>50%</span>
        </div>

        <span className="progress-bar">
          <span></span>
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
