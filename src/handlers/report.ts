import { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../helpers/utils'
import {
  GetDailySellRequest,
  GetDailyBestSeller,
  GetEmployeeSellRequest,
  GetMonthlySellRequest,
} from '../types/handlers/report'

export const getDailySell = async (req: GetDailySellRequest, res: FastifyReply) => {
  try {
    const { date } = req.body
    const selectDate = new Date(date)
    const startDate = new Date(
      selectDate.getUTCFullYear(),
      selectDate.getMonth(),
      selectDate.getDate()
    )
    const endDate = new Date(
      selectDate.getUTCFullYear(),
      selectDate.getMonth(),
      selectDate.getDate() + 1
    )

    const orders = await prisma.order.findMany({
      select: {
        total: true,
      },
      where: {
        AND: [
          { updatedAt: { gte: startDate } },
          { updatedAt: { lte: endDate } },
          { orderStatusId: 2 },
        ],
      },
    })

    let dailySell = 0

    for (const order of orders) {
      dailySell += order.total || 0
    }

    return res.send({ total: dailySell })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getEmployeeSell = async (req: GetEmployeeSellRequest, res: FastifyReply) => {
  try {
    const { employeeId } = req.body

    const orders = await prisma.order.findMany({
      select: {
        id: true,
        total: true,
        updatedAt: true,
      },
      where: { AND: [{ userId: employeeId }, { orderStatusId: 2 }] },
    })

    let totalSell = 0

    for (const order of orders) {
      totalSell += order.total || 0
    }

    return res.send({ orders, totalSell })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getSellByMonth = async (req: GetMonthlySellRequest, res: FastifyReply) => {
  try {
    const { date } = req.body
    const selectDate = new Date(date)
    const startDate = new Date(selectDate.getUTCFullYear(), selectDate.getMonth(), 1)
    const endDate = new Date(selectDate.getUTCFullYear(), selectDate.getMonth(), 30)

    const orders = await prisma.order.findMany({
      select: {
        total: true,
      },
      where: {
        AND: [
          { updatedAt: { gte: startDate } },
          { updatedAt: { lte: endDate } },
          { orderStatusId: 2 },
        ],
      },
    })

    let monthlySell = 0

    for (const order of orders) {
      monthlySell += order.total || 0
    }

    return res.send({ total: monthlySell })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getDailyBestSeller = async (req: GetDailyBestSeller, res: FastifyReply) => {
  try {
    const { date } = req.body
    const selectDate = new Date(date)
    const startDate = new Date(
      selectDate.getUTCFullYear(),
      selectDate.getMonth(),
      selectDate.getDate()
    )
    const endDate = new Date(
      selectDate.getUTCFullYear(),
      selectDate.getMonth(),
      selectDate.getDate() + 1
    )

    const orders = await prisma.order.findMany({
      select: {
        OrderDetail: {
          select: { product: { select: { id: true, name: true } }, quantity: true },
        },
      },
      where: {
        AND: [
          { updatedAt: { gte: startDate } },
          { updatedAt: { lte: endDate } },
          { orderStatusId: 2 },
        ],
      },
    })

    let productList: any[] = []

    for (const order of orders) {
      for (const orderDetail of order.OrderDetail) {
        if (productList.length === 0) {
          productList.push(orderDetail)
        } else {
          for (const i in productList) {
            if (productList[i].product.id === orderDetail.product.id) {
              productList[i].quantity += orderDetail.quantity
              break
            } else {
              productList.push(orderDetail)
            }
          }
        }
      }
    }
    let bestSeller = productList[0]

    for (const product of productList) {
      if (product.quantity > bestSeller.quantity) {
        bestSeller = product
      }
    }

    return res.send(bestSeller)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getBestSeller = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        OrderDetail: {
          select: { product: { select: { id: true, name: true } }, quantity: true },
        },
      },
      where: {
        orderStatusId: 2,
      },
    })

    let productList: any[] = []

    for (const order of orders) {
      for (const orderDetail of order.OrderDetail) {
        if (productList.length === 0) {
          productList.push(orderDetail)
        } else {
          for (const i in productList) {
            if (productList[i].product.id === orderDetail.product.id) {
              productList[i].quantity += orderDetail.quantity
              break
            } else {
              productList.push(orderDetail)
            }
          }
        }
      }
    }
    let bestSeller = productList[0]

    for (const product of productList) {
      if (product.quantity > bestSeller.quantity) {
        bestSeller = product
      }
    }

    return res.send(bestSeller)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getBestCategory = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        OrderDetail: {
          select: {
            product: { select: { category: { select: { id: true, name: true } } } },
            quantity: true,
          },
        },
      },
      where: {
        orderStatusId: 2,
      },
    })

    let categoryList: any[] = []

    for (const order of orders) {
      for (const orderDetail of order.OrderDetail) {
        if (categoryList.length === 0) {
          categoryList.push(orderDetail)
        } else {
          for (const i in categoryList) {
            if (categoryList[i].product.category.id === orderDetail.product.category.id) {
              categoryList[i].quantity += orderDetail.quantity
              break
            } else {
              categoryList.push(orderDetail)
            }
          }
        }
      }
    }

    let bestCategory = categoryList[0]

    for (const category of categoryList) {
      if (category.quantity > category.quantity) {
        bestCategory = category
      }
    }

    return res.send(bestCategory)
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}

export const getTotalSell = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const orders = await prisma.order.findMany({
      select: {
        total: true,
      },
      where: {
        orderStatusId: 2,
      },
    })

    let totalSell = 0

    for (const order of orders) {
      totalSell += order.total || 0
    }

    return res.send({ total: totalSell })
  } catch (error) {
    return res.status(500).send({ error: error })
  }
}
