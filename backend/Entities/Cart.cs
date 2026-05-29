public class Cart{
    public int Id { get; set; }
    public int IdStockProduct { get; set; }
    public StockProduct StockProduct { get; set; } = null!;
    public int TotalQuantity { get; set; }
    public int TotalPrice { get; set; }
}