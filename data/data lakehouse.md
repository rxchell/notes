## Data Lakehouse = Data Lake + Data Warehouse 
> A **data lakehouse** is a modern data architecture that creates a single platform by combining the key benefits of **data lakes (large repositories of raw data in its original form)** and **data warehouses (organized sets of structured data)**. Specifically, data lakehouses enable organizations to use low-cost storage to store large amounts of raw data while providing structure and data management functions
- Combines both by using open table formats (Delta Lake, Apache Iceberg, Hudi) on top of data lakes
- Adds schema enforcement, ACID transactions, data versioning, indexing
- Enables both BI/SQL workloads and ML/data science on the same storage layer

### Data Lakes
- store **raw, unstructured or semi-structured data** cheaply (e.g. logs, JSON, images, IoT streams) on distributed storage systems (S3, ADLS, HDFS) (object storage_
- cheap and scalable, but lacks schema enforcement, indexing, and ACID guarantees
- best for data science & ML, but **not optimized for BI/SQL workloads**

### Data Warehouse 
- stores **structured, curated** data in optimized columnar storage (e.g., Snowflake, BigQuery, Redshift), strong schema governance
- **optimized for analytics (OLAP)**, supports SQL queries, OLAP, star/snowflake schemas
- historically expensive, less flexible, and less suited for unstructured data
