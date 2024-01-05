import { RDS, Bucket, StackContext } from "sst/constructs";

export function StorageStack({ stack, app }: StackContext) {
    const bucket = new Bucket(stack, "Uploads", {
        cors: [
          {
            maxAge: "1 day",
            allowedOrigins: ["*"],
            allowedHeaders: ["*"],
            allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
          },
        ],
      });
    
  const DATABASE = "My_DB";
  // Create the Aurora DB cluster
  const cluster = new RDS(stack, "Cluster", {
    engine: "postgresql13.9",
    defaultDatabaseName: DATABASE,
    scaling: {
        // autopause: true if stage is not prod
        autoPause: stack.stage !== "prod",
        // maxCapacity if not prod set to "ACU_1" else set to "ACU_2",
        maxCapacity: stack.stage == "prod" ? "ACU_4" : "ACU_2",
        minCapacity:  "ACU_2",
      },
    migrations: "packages/functions/migrations",
    
  }); 

    return{
        bucket,
        cluster
    }
}