export const APK_FILE_PATH = '/oriviant-v1.apk';
export const APK_FILE_NAME = 'Oriviant-App.apk';

export const triggerApkDownload = (e?: { preventDefault?: () => void; stopPropagation?: () => void }) => {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const link = document.createElement('a');
  link.href = APK_FILE_PATH;
  link.setAttribute('download', APK_FILE_NAME);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};