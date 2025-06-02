// Sistema de monitoramento de performance do banco de dados
export interface QueryMetrics {
  queryName: string
  startTime: number
  endTime?: number
  duration?: number
  success: boolean
  errorMessage?: string
  recordCount?: number
}

class DatabaseMetrics {
  private metrics: QueryMetrics[] = []
  private readonly maxMetrics = 100 // Manter apenas os últimos 100 registros

  // Iniciar medição de uma consulta
  startQuery(queryName: string): QueryMetrics {
    const metric: QueryMetrics = {
      queryName,
      startTime: Date.now(),
      success: false
    }

    this.metrics.push(metric)
    
    // Remover métricas antigas se exceder o limite
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    return metric
  }

  // Finalizar medição de uma consulta
  endQuery(metric: QueryMetrics, success: boolean, recordCount?: number, errorMessage?: string): void {
    metric.endTime = Date.now()
    metric.duration = metric.endTime - metric.startTime
    metric.success = success
    metric.recordCount = recordCount
    metric.errorMessage = errorMessage

    // Log de performance para consultas lentas (> 5 segundos)
    if (metric.duration > 5000) {
      console.warn(`🐌 Consulta lenta detectada: ${metric.queryName} - ${metric.duration}ms`)
    }

    // Log de consultas que retornam muitos registros (> 1000)
    if (recordCount && recordCount > 1000) {
      console.warn(`📊 Consulta com muitos registros: ${metric.queryName} - ${recordCount} registros`)
    }
  }

  // Obter estatísticas básicas
  getStats(): {
    totalQueries: number
    successRate: number
    averageResponseTime: number
    slowestQuery: QueryMetrics | null
    fastestQuery: QueryMetrics | null
  } {
    const completedMetrics = this.metrics.filter(m => m.duration !== undefined)
    
    if (completedMetrics.length === 0) {
      return {
        totalQueries: 0,
        successRate: 0,
        averageResponseTime: 0,
        slowestQuery: null,
        fastestQuery: null
      }
    }

    const successfulQueries = completedMetrics.filter(m => m.success)
    const durations = completedMetrics.map(m => m.duration!).filter(d => d > 0)
    
    const averageResponseTime = durations.length > 0 
      ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length 
      : 0

    const slowestQuery = completedMetrics.reduce((slowest, current) => 
      (slowest.duration || 0) > (current.duration || 0) ? slowest : current
    )

    const fastestQuery = completedMetrics.reduce((fastest, current) => 
      (fastest.duration || Infinity) < (current.duration || Infinity) ? fastest : current
    )

    return {
      totalQueries: completedMetrics.length,
      successRate: (successfulQueries.length / completedMetrics.length) * 100,
      averageResponseTime: Math.round(averageResponseTime),
      slowestQuery,
      fastestQuery
    }
  }

  // Obter métricas recentes
  getRecentMetrics(limit: number = 10): QueryMetrics[] {
    return this.metrics
      .filter(m => m.duration !== undefined)
      .slice(-limit)
      .reverse()
  }

  // Limpar métricas
  clearMetrics(): void {
    this.metrics = []
  }

  // Obter métricas por nome de consulta
  getMetricsByQuery(queryName: string): QueryMetrics[] {
    return this.metrics.filter(m => 
      m.queryName === queryName && m.duration !== undefined
    )
  }
}

// Instância singleton para uso global
export const dbMetrics = new DatabaseMetrics()

// Helper para medir performance de consultas
export async function measureQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const metric = dbMetrics.startQuery(queryName)
  
  try {
    const result = await queryFn()
    
    // Tentar obter contagem de registros se for um array
    const recordCount = Array.isArray(result) ? result.length : undefined
    
    dbMetrics.endQuery(metric, true, recordCount)
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    dbMetrics.endQuery(metric, false, undefined, errorMessage)
    throw error
  }
}

// Função para imprimir estatísticas no console (útil para debug)
export function logDatabaseStats(): void {
  const stats = dbMetrics.getStats()
  
  console.log('📊 Estatísticas do Banco de Dados:')
  console.log(`   Total de consultas: ${stats.totalQueries}`)
  console.log(`   Taxa de sucesso: ${stats.successRate.toFixed(1)}%`)
  console.log(`   Tempo médio de resposta: ${stats.averageResponseTime}ms`)
  
  if (stats.slowestQuery) {
    console.log(`   Consulta mais lenta: ${stats.slowestQuery.queryName} (${stats.slowestQuery.duration}ms)`)
  }
  
  if (stats.fastestQuery) {
    console.log(`   Consulta mais rápida: ${stats.fastestQuery.queryName} (${stats.fastestQuery.duration}ms)`)
  }
} 