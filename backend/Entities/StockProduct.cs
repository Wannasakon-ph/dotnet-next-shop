public class StockProduct
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int StockQuantity { get; set; }
}