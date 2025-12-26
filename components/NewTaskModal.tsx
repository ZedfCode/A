
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { DownloadTask, DownloadStatus, FileType, Language } from '../types';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: DownloadTask) => void;
  lang: Language;
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [savePath, setSavePath] = useState('C:\\Users\\Administrator\\Desktop\\临时文件');
  const [diskSpace, setDiskSpace] = useState('29.67 GB');

  useEffect(() => {
    if (url.startsWith('http')) {
      const fileName = url.split('/').pop()?.split('?')[0] || '新建任务';
      setName(decodeURIComponent(fileName));
    }
  }, [url]);

  const handleBrowse = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker();
        setSavePath(`本地:\\磁盘\\${handle.name}`);
      } catch (e) {}
    }
  };

  const startDownload = async (openImmediately = false) => {
    if (!url) return;
    if (!('showSaveFilePicker' in window)) {
       alert("您的浏览器不支持原生文件写入，请使用 Chrome 或 Edge 浏览器。");
       return;
    }

    try {
      const handle = await (window as any).showSaveFilePicker({ suggestedName: name });
      // Added missing required fields from DownloadTask interface to ensure type safety
      const newTask: DownloadTask = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        name: handle.name,
        size: 0, // 会在连接后更新
        downloaded: 0,
        status: DownloadStatus.CONNECTING,
        type: FileType.OTHER,
        progress: 0,
        speed: 0,
        addedAt: Date.now(),
        fileHandle: handle,
        physicalPath: savePath,
        chunks: [],
        threads: 4,
        isRangeSupported: false
      };
      onAddTask(newTask);
      onClose();
    } catch (e) {
      console.log('取消保存');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-mask">
      <div className="bg-white rounded shadow-2xl w-[560px] border border-gray-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center px-4 py-2 border-b bg-gray-50 select-none">
          <span className="text-[13px] text-gray-700 font-medium">新建下载任务</span>
          <button onClick={onClose} className="text-gray-400 hover:text-black hover:bg-gray-200 p-1 rounded">
             <ICONS.Close className="w-4 h-4" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center">
            <label className="w-16 text-[13px] text-gray-600">网址：</label>
            <input 
              className="flex-1 border rounded px-3 py-1.5 focus:border-blue-500 bg-white"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://"
              autoFocus
            />
          </div>

          <div className="flex items-center">
            <label className="w-16 text-[13px] text-gray-600">文件名：</label>
            <input 
              className="flex-1 border rounded px-3 py-1.5 focus:border-blue-500 bg-white"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="w-16 text-[13px] text-gray-600">下载到：</label>
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative flex items-center">
                <select className="w-full border rounded px-2 py-1.5 appearance-none bg-white pr-20 text-[13px]">
                  <option value={savePath}>{savePath}</option>
                </select>
                <span className="absolute right-3 text-[11px] text-gray-400">剩: {diskSpace}</span>
              </div>
              <button onClick={handleBrowse} className="btn-fluent">浏览</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 px-8 py-5 bg-gray-50 border-t">
          <button onClick={() => startDownload(true)} className="btn-fluent">下载并打开</button>
          <button onClick={() => startDownload(false)} className="btn-fluent primary px-10">下载</button>
          <button onClick={onClose} className="btn-fluent px-8">取消</button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
