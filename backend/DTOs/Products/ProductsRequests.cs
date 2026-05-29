public record CreateProductRequest(
    string ProductName,
    int Price,
    int StockQuantity
);

public record UpdateProductRequest(
    int Id,
    string ProductName,
    int Price,
    int StockQuantity
);