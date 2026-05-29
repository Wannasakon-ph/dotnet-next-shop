public class CreateShoppingCarts
{ 
    public int IdCart { get; set; }
    public int IdStockProduct { get; set; }
    public int TotalQuantity { get; set; }
    public int TotalPrice { get; set; }
}

public class UpdateShoppingCarts
{
    public int IdCard {get; set;}
    public int IdStockProduct { get; set; }
    public int TotalQuantity { get; set; }
    public int TotalPrice { get; set; }
}