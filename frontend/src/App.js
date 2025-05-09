import { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function App() {
  const [msg, setMsg] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);

  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  function handleSubject(evt) {
    setSubject(evt.target.value);
  }

  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const emailData = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
      const totalEmails = emailData.map(item => item.A).filter(email => email);
      setEmailList(totalEmails);
    };
    reader.readAsBinaryString(file);
  }

  function send() {
    if (!msg.trim() || !subject.trim()) {
      alert("Please enter both subject and message.");
      return;
    }
    if (emailList.length === 0) {
      alert("Please upload an Excel file with emails.");
      return;
    }

    setStatus(true);
    axios.post("http://localhost:5000/send-mails", {
      emails: emailList,
      subject: subject,
      message: msg
    })
      .then(response => {
        if (response.data.success) {
          alert("Emails sent successfully!");
        } else {
          alert("Failed to send emails.");
        }
        setStatus(false);
      })
      .catch(error => {
        console.error(error);
        alert("An error occurred. Please check the server.");
        setStatus(false);
      });
  }

  return (
    <div>
      <div className="bg-blue-800 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">BulkMail</h1>
      </div>
      <div className="bg-blue-700 text-white text-center">
        <h1 className="text-2xl font-medium px-5 py-3">
          Send Multiple Emails Easily
        </h1>
      </div>
      <div className="bg-blue-400 flex flex-col items-center text-black px-5 py-3">
        <input
          type="text"
          onChange={handleSubject}
          value={subject}
          placeholder="Enter email subject..."
          className="w-4/5 py-2 outline-none px-2 border border-black rounded-md mb-4"
        />
        <textarea
          onChange={handleMsg}
          value={msg}
          className="w-4/5 h-32 py-2 outline-none px-2 border border-black rounded-md"
          placeholder="Enter the email text..."
        />
        <div>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFile}
            className="border-4 border-dashed py-4 px-4 mt-5 mb-5"
          />
        </div>
        <p>Total emails in the file: {emailList.length}</p>
        <button
          onClick={send}
          disabled={status}
          className={`mt-2 py-2 px-4 text-white font-medium rounded-md w-fit ${
            status ? "bg-gray-500" : "bg-blue-950"
          }`}
        >
          {status ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}

export default App;
