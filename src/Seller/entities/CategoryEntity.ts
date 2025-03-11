
// Defining the Category Entity interface
export interface CategoryEntity extends Document {
    name: string;      
    cid: string;       
    cdt: Date;         // Creation date of the category
    cpic: string;      // Category picture (URL or file path)
}
