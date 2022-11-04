import { reactive } from "vue"

interface IDefaultPaginationData {
  totalCount: number
  page: number
  pageSizes: number[]
  size: number
  layout: string
}

interface IPaginationData {
  totalCount?: number
  page?: number
  pageSizes?: number[]
  size?: number
  layout?: string
}

/** 默认的分页参数 */
const defaultPaginationData: IDefaultPaginationData = {
  totalCount: 0,
  page: 1,
  pageSizes: [10, 20, 50],
  size: 10,
  layout: "total, sizes, prev, pager, next, jumper"
}

export const usePagination = (_paginationData: IPaginationData = {}) => {
  /** 合并分页参数 */
  const paginationData = reactive(Object.assign({ ...defaultPaginationData }, _paginationData))

  /** 改变当前页码 */
  const handleCurrentChange = (value: number) => {
    paginationData.page = value
  }

  /** 改变页面大小 */
  const handleSizeChange = (value: number) => {
    paginationData.size = value
  }

  return { paginationData, handleCurrentChange, handleSizeChange }
}
