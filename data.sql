-- Sample data for authors
INSERT INTO authors (name, biography, contact_information)
VALUES 
('Author 1', 'Biography of Author 1', 'author1@example.com'),
('Author 2', 'Biography of Author 2', 'author2@example.com');

-- Sample data for books
INSERT INTO books (title, author_id, publisher, publication_date, isbn, genre, price)
VALUES 
('Book 1', 1, 'Publisher 1', '2020-01-01', '9780000000001', 'Fiction', 15.99),
('Book 2', 1, 'Publisher 1', '2020-02-01', '9780000000002', 'Fiction', 13.69),
('Book 3', 1, 'Publisher 1', '2020-03-01', '9780000000003', 'Fiction', 16.59),
('Book 4', 2, 'Publisher 2', '2020-04-01', '9780000000004', 'Fiction', 15.99),
('Book 5', 2, 'Publisher 2', '2020-05-01', '9780000000005', 'Fiction', 15.99),
('Book 6', 2, 'Publisher 2', '2020-06-01', '9780000000006', 'Fiction', 15.99),
('Book 7', 1, 'Publisher 1', '2020-07-01', '9780000000007', 'Fiction', 15.99),
('Book 8', 1, 'Publisher 1', '2020-08-01', '9780000000008', 'Fiction', 15.99),
('Book 9', 2, 'Publisher 2', '2020-09-01', '9780000000009', 'Fiction', 15.99),
('Book 10', 2, 'Publisher 2', '2020-10-01', '9780000000010', 'Fiction', 16.59);

-- Sample data for customers
INSERT INTO customers (name, email, address, phone_number, payment_information)
VALUES ('John Doe', 'john.doe@example.com', '123 Main St, Springfield', '555-123-4567', 'Visa **** 1234');

-- Sample data for orders
INSERT INTO orders (date, order_number, customer_id, status)
VALUES ('2022-01-01', 1001, 1, 'Delivered');

-- Sample data for transactions
INSERT INTO transactions (order_id, payment_amount, payment_date, payment_method)
VALUES (1, 19.99, '2022-01-01', 'Credit Card');
