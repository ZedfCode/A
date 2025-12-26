
import { Language } from '../types';

const translations = {
  zh: {
    app_name: "智速下载",
    version: "极客重制版",
    all_tasks: "全部任务",
    downloading: "活跃任务",
    completed: "历史归档",
    trash: "回收站",
    new_task: "新增下载",
    search_placeholder: "检索文件名、哈希或标签...",
    start_all: "全部开始",
    pause_all: "全部挂起",
    clear_finished: "清除已完成",
    copy_link: "复制链接",
    verify_hash: "校验哈希",
    open_folder: "打开目录",
    export_to_local: "导出到磁盘",
    priority: "优先级",
    sort_by: "排序方式",
    sort_time: "时间",
    sort_size: "大小",
    sort_progress: "进度",
    console_label: "内核日志",
    bitfield_label: "分段进度图 (Bitfield)",
    items: "个任务",
    active_tunnels: "活跃隧道",
    avg_latency: "平均延迟"
  },
  en: {
    app_name: "SmartSpeed",
    version: "Geek Remaster",
    all_tasks: "All Tasks",
    downloading: "Active",
    completed: "History",
    trash: "Trash",
    new_task: "New Task",
    search_placeholder: "Search name, hash...",
    start_all: "Start All",
    pause_all: "Pause All",
    clear_finished: "Clear Finished",
    copy_link: "Copy Link",
    verify_hash: "Verify Hash",
    open_folder: "Open Folder",
    export_to_local: "Export Local",
    priority: "Priority",
    sort_by: "Sort",
    sort_time: "Time",
    sort_size: "Size",
    sort_progress: "Progress",
    console_label: "Kernel Log",
    bitfield_label: "Bitfield Map",
    items: "tasks",
    active_tunnels: "Active Tunnels",
    avg_latency: "Latency"
  }
};

export const t = (key: keyof typeof translations.zh, lang: Language, params?: Record<string, any>): string => {
  let text = translations[lang][key] || key;
  if (params) {
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
  }
  return text;
};
