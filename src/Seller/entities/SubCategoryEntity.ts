
// Defining the Subcategory Entity interface
export interface SubCategoryEntity extends Document {
    name: string;        
    scid: string;         
    cdt: Date;           // Creation date of the subcategory
    scpic: string;        // Subcategory picture (URL or file path)
    categoryId: string;  // Reference to the parent category (categoryId)
}

