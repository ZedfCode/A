
import { Language } from '../types';

const translations = {
  zh: {
    app_name: "智速下载",
    version: "工业级重制版",
    all_tasks: "任务矩阵",
    downloading: "活跃流",
    completed: "归档库",
    trash: "回收站",
    new_task: "建立任务",
    search_placeholder: "检索文件名、哈希或标签...",
    start_all: "激活全量",
    pause_all: "紧急挂起",
    clear_finished: "清除冗余",
    copy_link: "提取链接",
    verify_hash: "校验哈希",
    open_folder: "定位资源",
    export_to_local: "同步本地",
    priority: "调度权重",
    sort_by: "排序策略",
    sort_time: "时间序",
    sort_size: "容量序",
    sort_progress: "进度序",
    console_label: "内核通信日志",
    bitfield_label: "扇区同步状态 (Bitfield)",
    items: "个对象",
    active_tunnels: "活跃隧道",
    avg_latency: "平均时延",
    force_start: "强力破限",
    preview_btn: "边下边播",
    health_label: "节点健康度",
    peers_label: "P2P 节点数",
    save_success: "资源已写入磁盘"
  },
  en: {
    app_name: "SmartSpeed",
    version: "Industrial Remaster",
    all_tasks: "Task Matrix",
    downloading: "Active",
    completed: "Archive",
    trash: "Trash",
    new_task: "New Task",
    search_placeholder: "Search name, hash...",
    start_all: "Start All",
    pause_all: "Suspend All",
    clear_finished: "Clear Finished",
    copy_link: "Copy URL",
    verify_hash: "Verify Hash",
    open_folder: "Locate",
    export_to_local: "Export Local",
    priority: "Priority",
    sort_by: "Sort",
    sort_time: "Time",
    sort_size: "Size",
    sort_progress: "Progress",
    console_label: "Kernel Log",
    bitfield_label: "Sector Map",
    items: "tasks",
    active_tunnels: "Active",
    avg_latency: "Latency",
    force_start: "Force Start",
    preview_btn: "Preview",
    health_label: "Health",
    peers_label: "Peers",
    save_success: "Written to disk"
  }
};

export const t = (key: keyof typeof translations.zh, lang: Language, params?: Record<string, any>): string => {
  let text = translations[lang]?.[key] || key;
  if (params) {
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p]);
    });
  }
  return text;
};
