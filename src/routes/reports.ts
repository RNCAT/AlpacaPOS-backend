import { FastifyInstance } from 'fastify'
import {
  getDailySell,
  getDailyBestSeller,
  getTotalSell,
  getBestSeller,
  getEmployeeSell,
  getSellByMonth,
  getBestCategory,
} from '../handlers/report'

const reportRouters = async (app: FastifyInstance) => {
  app.post('/dailysell', getDailySell)
  app.post('/dailybestseller', getDailyBestSeller)
  app.get('/totalsell', getTotalSell)

  app.get('/bestseller', getBestSeller)
  app.get('/bestcategory', getBestCategory)
  app.post('/employeesell', getEmployeeSell)
  app.post('/sellbymonth', getSellByMonth)
}

export default reportRouters
