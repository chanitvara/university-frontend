import React, { useState, useEffect } from 'react';

// --- Helper Components (Icons) ---
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-69.5 69.5c-24.3-23.4-58.4-37.8-97.4-37.8-86.1 0-156.2 70.1-156.2 156.2s70.1 156.2 156.2 156.2c99.7 0 133.2-80.1 137.9-119.3H248v-85.3h236.1c2.3 12.7 3.9 26.1 3.9 40.2z"></path>
    </svg>
);

// --- Mock Data (will be replaced by fetching from backend later) ---
const initialPhotos = [
  { id: 1, src: 'https://placehold.co/600x400/3498db/ffffff?text=กิจกรรมรับน้อง', event: 'กิจกรรมรับน้อง 2568', photographer: 'สมชาย ใจดี', date: '2025-07-15' },
  { id: 2, src: 'https://placehold.co/600x400/e74c3c/ffffff?text=งานกีฬาสี', event: 'งานกีฬาสี', photographer: 'สมหญิง เก่งมาก', date: '2025-06-20' },
  { id: 3, src: 'https://placehold.co/600x400/2ecc71/ffffff?text=พิธีไหว้ครู', event: 'พิธีไหว้ครู', photographer: 'ทีมงานสโมสร', date: '2025-06-10' },
];

// --- UI Components ---

// Header Component
const Header = ({ user, onLogout }) => (
  <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">University Photo Hub</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-gray-700 dark:text-gray-300">สวัสดี, {user.name}</span>
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <a href="https://university-backend-yxs6.onrender.com" className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
              <GoogleIcon />
              เข้าสู่ระบบเพื่ออัปโหลด
            </a>
          )}
        </div>
      </div>
    </div>
  </header>
);

// Upload Form Component - **UPDATED FOR REAL UPLOAD**
const UploadForm = ({ onPhotoUploaded }) => {
    const [form, setForm] = useState({ event: '', photographer: '', date: new Date().toISOString().split('T')[0] });
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFileChange = (e) => e.target.files[0] && setFile(e.target.files[0]);

    // **THIS IS THE FINAL, REAL SUBMIT HANDLER**
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.event || !form.photographer || !file) {
            setMessage({ text: 'กรุณากรอกข้อมูลให้ครบและเลือกไฟล์ภาพ', type: 'error' });
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        
        setIsUploading(true);
        setMessage({ text: 'กำลังอัปโหลดขึ้น Google Drive...', type: 'info' });

        // ใช้ FormData เพื่อแพ็คข้อมูลทั้งหมด (text และ file) เข้าด้วยกัน
        const formData = new FormData();
        formData.append('event', form.event);
        formData.append('photographer', form.photographer);
        formData.append('date', form.date);
        formData.append('imageFile', file); // 'imageFile' ต้องตรงกับที่ Backend กำหนดไว้ (upload.single('imageFile'))

        try {
            // ส่ง request ไปยัง Backend ของเรา
            const response = await fetch('https://university-backend-yxs6.onrender.com', {
                method: 'POST',
                body: formData, // ไม่ต้องใส่ Content-Type header, browser จะจัดการให้เองเมื่อใช้ FormData
            });

            const result = await response.json();

            if (!response.ok) {
                // ถ้ามี error จากฝั่ง server
                throw new Error(result.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
            }
            
            setIsUploading(false);
            setMessage({ text: 'อัปโหลดสำเร็จ!', type: 'success' });
            
            // เพิ่มรูปที่อัปโหลดสำเร็จลงในแกลเลอรีทันทีเพื่อ UX ที่ดี
            const newPhoto = {
                id: result.file.id,
                src: URL.createObjectURL(file), // แสดงรูปจาก local ก่อน
                event: form.event,
                photographer: form.photographer,
                date: form.date,
            };
            onPhotoUploaded(newPhoto);

            // Reset form
            setForm({ event: '', photographer: '', date: new Date().toISOString().split('T')[0] });
            setFile(null);
            document.getElementById('file-upload').value = null;
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            setIsUploading(false);
            setMessage({ text: error.message, type: 'error' });
            console.error('Upload failed:', error);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const messageColor = { error: 'text-red-600 dark:text-red-400', success: 'text-green-600 dark:text-green-400', info: 'text-blue-600 dark:text-blue-400' };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-4">อัปโหลดรูปภาพใหม่</h2>
            <form onSubmit={handleSubmit}>
                {/* ... form fields are the same ... */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่องาน/กิจกรรม</label><input type="text" name="event" id="event" value={form.event} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="เช่น งานกีฬาสี 2568" /></div>
                        <div><label htmlFor="photographer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ชื่อผู้ถ่าย</label><input type="text" name="photographer" id="photographer" value={form.photographer} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="ชื่อ-สกุล หรือนามแฝง" /></div>
                        <div><label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">วันที่จัดกิจกรรม</label><input type="date" name="date" id="date" value={form.date} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">เลือกไฟล์ภาพ</label><input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" /></div>
                    <div className="flex items-center justify-between">
                        <button type="submit" disabled={isUploading} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                            {isUploading ? 'กำลังอัปโหลด...' : <><UploadIcon /> อัปโหลด</>}
                        </button>
                        {message && <p className={`text-sm ${messageColor[message.type]}`}>{message.text}</p>}
                    </div>
                </div>
            </form>
        </div>
    );
};

// Photo Gallery Component
const PhotoGallery = ({ photos }) => (
    <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">แกลเลอรีล่าสุด</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo) => (
                <div key={photo.id} className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                    <img src={photo.src} alt={photo.event} className="w-full h-48 object-cover" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Error'; }}/>
                    <div className="p-4">
                        <h3 className="font-bold text-md truncate">{photo.event}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">โดย: {photo.photographer}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{photo.date}</p>
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                        <a href={photo.src} download={`${photo.event}_${photo.id}.jpg`} className="opacity-0 group-hover:opacity-100 text-white bg-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold">
                            ดาวน์โหลด
                        </a>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState(initialPhotos);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userDataString = params.get('user');
    if (userDataString) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataString));
        setUser(userData); 
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Failed to parse user data from URL", error);
      }
    }
  }, []);

  const handleLogout = () => setUser(null);
  const handlePhotoUploaded = (newPhoto) => setPhotos([newPhoto, ...photos]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} onLogout={handleLogout} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {user && <UploadForm onPhotoUploaded={handlePhotoUploaded} />}
        <PhotoGallery photos={photos} />
      </main>
    </div>
  );
}
