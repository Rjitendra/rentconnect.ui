import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeModule,
} from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlatTreeControl } from '@angular/cdk/tree';
/** Flat node with expandable and level information */
interface FlatTreeNode {
  name: string;
  level: number;
  expandable: boolean;
}

/** Data source that accepts generic type of data and has nested levels. */
interface ExampleFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/** The initial data used to build the flat tree. */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

const TREE_DATA: FoodNode[] = [
  {
    name: 'Fruits',
    children: [{ name: 'Apple' }, { name: 'Banana' }],
  },
  {
    name: 'Vegetables',
    children: [
      {
        name: 'Green',
        children: [{ name: 'Broccoli' }, { name: 'Spinach' }],
      },
      {
        name: 'Yellow',
        children: [{ name: 'Corn' }, { name: 'Bell pepper' }],
      },
    ],
  },
];
@Component({
  selector: 'ng-tree',
  imports: [MatTreeModule, MatButtonModule, MatIconModule],
  templateUrl: './ng-tree.component.html',
  styleUrl: './ng-tree.component.scss',
})
export class NgTreeComponent {
  treeControl = new FlatTreeControl<ExampleFlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  private _transformer = (node: FoodNode, level: number) => {
    return {
      item: node.name,
      level: level,
      expandable: !!node.children?.length,
    };
  };

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    (node) => node.level,
    (node) => node.expandable,
    (node) => node.children,
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  constructor() {
    this.dataSource.data = TREE_DATA;
  }

  hasChild = (_: number, node: ExampleFlatNode) => node.expandable;

  ngOnInit(): void {}
}
