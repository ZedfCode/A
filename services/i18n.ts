
import { Language } from '../types';

const translations = {
  zh: {
    app_name: "智速下载",
    version: "极客重制版",
    all_tasks: "任务阵列",
    downloading: "活跃流",
    completed: "归档库",
    trash: "回收站",
    new_task: "新增隧道",
    search_placeholder: "检索文件名、哈希或特征...",
    start_all: "激活全量",
    pause_all: "紧急挂起",
    clear_finished: "清理冗余",
    copy_link: "提取链接",
    verify_hash: "完整性校验",
    open_folder: "定位资源",
    export_to_local: "同步磁盘",
    priority: "调度优先级",
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
    save_success: "资源已写入本地磁盘"
  },
  en: {
    app_name: "SmartSpeed",
    version: "Geek Remaster",
    all_tasks: "Task Array",
    downloading: "Active",
    completed: "Archive",
    trash: "Trash",
    new_task: "New Tunnel",
    search_placeholder: "Search name, hash...",
    start_all: "Start All",
    pause_all: "Suspend All",
    clear_finished: "Clear Done",
    copy_link: "Copy URL",
    verify_hash: "Verify Hash",
    open_folder: "Locate",
    export_to_local: "Export Local",
    priority: "Priority",
    sort_by: "Sort",
    sort_time: "By Time",
    sort_size: "By Size",
    sort_progress: "By Progress",
    console_label: "Kernel Log",
    bitfield_label: "Sector Map (Bitfield)",
    items: "tasks",
    active_tunnels: "Active Tunnels",
    avg_latency: "Latency",
    force_start: "Force Start",
    preview_btn: "Preview",
    health_label: "Health",
    peers_label: "Peers",
    save_success: "Resource written to disk"
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
