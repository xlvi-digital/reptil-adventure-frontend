package main

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Order struct {
  ID           uint      `gorm:"primaryKey"`
  OrderInvoice string    `gorm:"column:order_invoice"`
  GrandTotal   float64   `gorm:"column:grand_total"`
  CreatedAt    time.Time `gorm:"column:created_at"`
  Status       string    `gorm:"column:status"`
}

type DashboardStatsResponse struct {
  TodayOrders  int64                `json:"today_orders"`
  MonthOrders  int64                `json:"month_orders"`
  TodayRevenue float64              `json:"today_revenue"`
  MonthRevenue float64              `json:"month_revenue"`
  SalesChart   []SalesChartPoint    `json:"sales_chart"`
}

type SalesChartPoint struct {
  Label   string  `json:"label"`
  Revenue float64 `json:"revenue"`
}

func GetDashboardStats(c *gin.Context) {
  now := time.Now().UTC()
  startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
  endOfDay := startOfDay.Add(24*time.Hour - time.Second)
  startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

  statuses := []string{"PAID", "SHIPPED", "SELESAI", "DONE"}
  normalizedStatuses := make([]string, len(statuses))
  for i, status := range statuses {
    normalizedStatuses[i] = strings.ToUpper(status)
  }

  var todayOrders, monthOrders int64
  var todayRevenue, monthRevenue float64

  todayQuery := c.MustGet("db").(*gorm.DB).Model(&Order{}).
    Where("status IN ?", normalizedStatuses).
    Where("created_at >= ? AND created_at <= ?", startOfDay, endOfDay)
  monthQuery := c.MustGet("db").(*gorm.DB).Model(&Order{}).
    Where("status IN ?", normalizedStatuses).
    Where("created_at >= ?", startOfMonth)

  todayQuery.Count(&todayOrders)
  monthQuery.Count(&monthOrders)

  var todayRevenueRow struct{ Sum float64 }
  var monthRevenueRow struct{ Sum float64 }

  todayQuery.Select("COALESCE(SUM(grand_total), 0)").Scan(&todayRevenueRow)
  monthQuery.Select("COALESCE(SUM(grand_total), 0)").Scan(&monthRevenueRow)

  todayRevenue = todayRevenueRow.Sum
  monthRevenue = monthRevenueRow.Sum

  salesRows := []struct {
    Day     string
    Revenue float64
  }{}

  sevenDaysAgo := now.AddDate(0, 0, -6)
  c.MustGet("db").(*gorm.DB).Model(&Order{}).
    Where("status IN ?", normalizedStatuses).
    Where("created_at >= ?", sevenDaysAgo).
    Select("DATE(created_at) as day, COALESCE(SUM(grand_total), 0) as revenue").
    Group("DATE(created_at)").
    Order("day ASC").
    Scan(&salesRows)

  salesMap := make(map[string]float64, len(salesRows))
  for _, row := range salesRows {
    salesMap[row.Day] = row.Revenue
  }

  chart := make([]SalesChartPoint, 7)
  for i := 0; i < 7; i++ {
    day := sevenDaysAgo.AddDate(0, 0, i)
    label := day.Format("02 Jan")
    chart[i] = SalesChartPoint{Label: label, Revenue: salesMap[day.Format("2006-01-02")]}
  }

  c.JSON(http.StatusOK, DashboardStatsResponse{
    TodayOrders:  todayOrders,
    MonthOrders:  monthOrders,
    TodayRevenue: todayRevenue,
    MonthRevenue: monthRevenue,
    SalesChart:   chart,
  })
}

func RegisterAdminRoutes(r *gin.Engine) {
  admin := r.Group("/api/v1/admin")
  admin.GET("/dashboard-stats", GetDashboardStats)
}
