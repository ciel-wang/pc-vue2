import Vue from 'vue'

const downLoadFile = (data,fileName = "",type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") => {
  let y = new Date().getFullYear();
  let M = '00' + (new Date().getMonth()+1);
  M = M.substr(M.length-2);
  let d = '00' + new Date().getDate();
  d = d.substr(d.length-2);
  let h = '00' + new Date().getHours();
  h = h.substr(h.length-2);
  let m = '00' + new Date().getMinutes();
  m = m.substr(m.length-2);
  let s = '00' + new Date().getSeconds();
  s = s.substr(s.length-2);
  let curTime = y+M+d+h+m+s;
  const link = document.createElement('a');
  const blob = new Blob([data], { type: type })
  link.style.display = 'none';
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName+curTime; //下载的文件名
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(link);
}
let typeArr = [
    {value:'.7z',type:'application/x-7z-compressed'},
    {value:'.zip',type:'application/zip'},
    {value:'.jar',type:'application/java-archive'},
    {value:'.rar',type:'application/x-rar-compressed'},
    {value:'.woff2',type:'font/woff2'},
    {value:'.woff',type:'font/woff'},
    {value:'.ttf',type:'font/ttf'},
    {value:'.webp',type:'image/webp'},
    {value:'.png',type:'image/png'},
    {value:'.svg',type:'image/svg+xml'},
    {value:'.jpg',type:'image/jpeg'},
    {value:'.gif',type:'image/gif'},
    {value:'.webm',type:'video/webm'},
    {value:'.ogv',type:'video/ogg'},
    {value:'.weba',type:'audio/webm'},
    {value:'.oga',type:'audio/ogg'},
    {value:'.wav',type:'audio/wav'},
    {value:'.mp3',type:'audio/mpeg'},
    {value:'.doc',type:'application/msword'},
    {value:'.docx',type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'},
    {value:'.pptx',type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'},
    {value:'.ppt',type:'application/vnd.ms-powerpoint'},
    {value:'.xlsx',type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
    {value:'.xls',type:'application/vnd.ms-excel'},
    {value:'.pdf',type:'application/pdf'},
    {value:'.ogx',type:'application/ogg'},
    {value:'.json',type:'application/json'},
    {value:'.xhtml',type:'application/xhtml+xml'},
    {value:'.xml',type:'application/text/xml'},
    {value:'.html	',type:'text/html'},
    {value:'.js',type:'text/javascript'},
    {value:'.css',type:'text/css'},
    {value:'.csv',type:'text/csv'},
    {value:'.txt',type:'text/plain'},
]
const type = (type) => {
    let item = typeArr.find(v => v.value === type);
    return item && item.type
}
export default function(Vue) {
  Vue.prototype.$w = {
    downLoadFile
  }
}
