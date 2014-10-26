var listItemViewModel = (function () {

    function ListItem(values) {
        values = values || {};
        if (!(this instanceof ListItem)) return new ListItem(values);
        else if (this.initialized) return;

        var node = values.node || values;
        var vm = this;
        this.text = ko.observable(ko.utils.unwrapObservable(node.text));
        this.complete = ko.observable(ko.utils.unwrapObservable(node.complete));
        this.children = ko.observableArray(ko.utils.arrayMap(ko.utils.unwrapObservable(node.children) || [], ListItem));
        this.collapsed = ko.observable(false);
        this.isActive = ko.observable(false);

        this.initialized = true;
    }

    ListItem.prototype.ToggleVisible = function () {
        this.collapsed(!this.collapsed());
    }
    ListItem.prototype.AddNode = function (values) {
        var node = new ListItem();
        ko.contextFor(arguments[1].target).$data.children.push(node);
    }
    ListItem.prototype.AddNodeSameLevel = function (values) {
        var node = new ListItem();
        ko.contextFor(arguments[1].target).$parent.children.push(node);
    }
    ListItem.prototype.RemoveNode = function (context) {
        ko.contextFor(arguments[1].target).$parent.children.remove(context);
    }

    return {
        init: init,
    }

    function init() {
        var vm = {
            search: ko.observable(),
            rootNode: ko.observable(),
            newListName: ko.observable(),

            displayNodes: ko.observableArray([]),
            lists: ko.observableArray([]),

            setListsData: function (lists) {
                var mappedLists = ko.utils.arrayMap(lists, ListItem);
                vm.lists(mappedLists);
                vm.loadList(mappedLists[0]);
            },
            filterNodes: function () {
                var search = vm.search();

                var filtered = search && search.length
                    ? findNodesBy(vm.search(), vm.rootNode().children())
                    : [vm.rootNode()];

                vm.displayNodes(filtered);
            },
            clearFilter: function () {
                vm.search(null);
                vm.filterNodes();
            },
            loadList: function (values) {
                //var item = values instanceof ListItem ? values : new ListItem(values);
                var item = values;
                
                vm.rootNode(item);
                vm.displayNodes([item]);
                setActiveStates();

                function setActiveStates() {
                    ko.utils.arrayForEach(vm.lists(), function(list) {
                        list.isActive(item === list);
                    });
                }
            },
            createNewList: function (values) {
                var name = vm.newListName();
                if (!name || !name.length) return;
                var list = new ListItem({ text: name });
                list.children.push(new ListItem());
                values.lists.push(list);
                vm.loadList(list);

                vm.newListName(null);
            },
            deleteList: function (context, args) {
                vm.lists.remove(context);
            }
        }


        vm.displayNodes.push(vm.rootNode());
        return vm;
    }

    function findNodesBy(searchText, nodes) {
        var regex = new RegExp(".*(" + searchText + ").*", "i");
        return ko.utils.arrayFilter(nodes, function (n) {
            return regex.test(n.text());
        });
    }

}())