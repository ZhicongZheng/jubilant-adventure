const SYSTEM_NAME = "v3-admin-vite"

/** 缓存数据时用到的 Key */
class CacheKey {
  static TOKEN = `${SYSTEM_NAME}-token-key`
  static COOKIE_NAME = "PLAY_SESSION"
  static SIDEBAR_STATUS = `${SYSTEM_NAME}-sidebar-status-key`
  static ACTIVE_THEME_NAME = `${SYSTEM_NAME}-active-theme-name-key`
  static UPLOAD_SIZE = 200
}

export default CacheKey
