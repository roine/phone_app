var joliCreator = function() {
    var joli = {
        each: function(collection, iterator, bind) {
            var i, l, property;
            switch (joli.getType(collection)) {
              case "array":
                for (i = 0, l = collection.length; l > i; i++) iterator.call(bind, collection[i], i);
                break;

              case "object":
                for (property in collection) collection.hasOwnProperty(property) && iterator.call(bind, collection[property], property);
            }
        },
        extend: function(baseClass, options) {
            var opt, prop;
            this.options || (this.options = {});
            this.parent = new baseClass(options);
            for (prop in this.parent) this[prop] = this[prop] || this.parent[prop];
            for (opt in this.parent.options) this.options[opt] = this.options[opt] || this.parent.options[opt];
        },
        getType: function(obj) {
            return "undefined" == typeof obj || null === obj || "number" == typeof obj && isNaN(obj) ? false : obj.constructor === Array || Array.isArray && Array.isArray(obj) ? "array" : typeof obj;
        },
        jsonParse: function(json) {
            return JSON.parse(json);
        },
        merge: function() {
            var i, l, prop;
            var mergedObject = {};
            for (i = 0, l = arguments.length; l > i; i++) {
                var object = arguments[i];
                if ("object" !== joli.getType(object)) continue;
                for (prop in object) if (object.hasOwnProperty(prop)) {
                    var objectProp = object[prop], mergedProp = mergedObject[prop];
                    mergedObject[prop] = mergedProp && "object" === joli.getType(objectProp) && "object" === joli.getType(mergedProp) ? joli.merge(mergedProp, objectProp) : objectProp;
                }
            }
            return mergedObject;
        },
        setOptions: function(options, defaults) {
            var opt;
            options || (options = {});
            this.options || (this.options = {});
            var mergedOptions = joli.merge(defaults, options);
            for (opt in defaults) this.options[opt] = mergedOptions[opt];
        },
        toQueryString: function(obj) {
            var queryStringComponents = [];
            obj || (obj = {});
            joli.each(obj, function(val, key) {
                var result = null;
                switch (joli.getType(val)) {
                  case "object":
                    result = joli.toQueryString(val);
                    break;

                  case "array":
                    result = joli.toQueryString(val);
                    break;

                  default:
                    result = encodeURIComponent(val);
                }
                result && queryStringComponents.push(key + "=" + result);
            });
            return "[" + queryStringComponents.join("&") + "]";
        },
        typeValue: function(val) {
            if (!joli.getType(val)) return "NULL";
            if ("string" === joli.getType(val)) {
                val = val.replace(/'/g, "''");
                val = val.replace(/\$/g, "$$$$");
                val = "'" + val + "'";
            } else if ("boolean" === joli.getType(val)) return val ? "1" : "0";
            return val;
        }
    };
    joli.Connection = function(database, file) {
        this.dbname = database;
        this.database = file ? Titanium.Database.install(file, this.dbname) : Titanium.Database.open(this.dbname);
        this.database.execute("PRAGMA read_uncommitted=true");
    };
    joli.Connection.prototype = {
        disconnect: function() {
            this.database.close();
        },
        execute: function(query) {
            return this.database.execute(query);
        },
        lastInsertRowId: function() {
            return this.database.lastInsertRowId;
        }
    };
    joli.migration = function(options) {
        var defaults = {
            tableName: "migration"
        };
        joli.setOptions.call(this, options, defaults);
        this.table = this.options.tableName;
    };
    joli.migration.prototype = {
        getVersion: function() {
            var q = new joli.query().select().from(this.table).order("version desc");
            var version = q.execute();
            if (version.length > 0) return version[0].version;
            q = new joli.query().insertInto(this.table).values({
                version: 0
            });
            q.execute();
            return 0;
        },
        setVersion: function(version) {
            var q = new joli.query().update(this.table).set({
                version: version
            });
            q.execute();
        }
    };
    joli.model = function(options) {
        var defaults = {
            table: "",
            columns: {},
            objectMethods: {}
        };
        options.methods && joli.each(options.methods, function(method, name) {
            this[name] = method;
        }, this);
        joli.setOptions.call(this, options, defaults);
        this.table = this.options.table;
        joli.models.has(this.table) || joli.models.set(this.table, this);
    };
    joli.model.prototype = {
        all: function(constraints) {
            var q = new joli.query().select().from(this.table);
            constraints || (constraints = {});
            constraints.where && joli.each(constraints.where, function(value, field) {
                q.where(field, value);
            });
            constraints.order && q.order(constraints.order);
            constraints.limit && q.limit(constraints.limit);
            return q.execute();
        },
        count: function(constraints) {
            var q = new joli.query().count().from(this.table);
            constraints || (constraints = {});
            constraints.where && joli.each(constraints.where, function(value, field) {
                q.where(field, value);
            });
            return parseInt(q.execute(), 10);
        },
        deleteRecords: function(id) {
            var q = new joli.query().destroy().from(this.table);
            "number" === joli.getType(id) ? q.where("id = ?", id) : "array" === joli.getType(id) && q.whereIn("id", id);
            return q.execute();
        },
        exists: function(id) {
            var count = new joli.query().count().from(this.table).where("id = ?", id).execute();
            return count > 0;
        },
        findBy: function(field, value) {
            return new joli.query().select().from(this.table).where(field + " = ?", value).execute();
        },
        findById: function(value) {
            return this.findBy("id", value);
        },
        findOneBy: function(field, value) {
            var result = new joli.query().select().from(this.table).where(field + " = ?", value).limit(1).execute();
            return 0 === result.length ? false : result[0];
        },
        findOneById: function(value) {
            return this.findOneBy("id", value);
        },
        getColumns: function() {
            return this.options.columns;
        },
        newRecord: function(values) {
            values || (values = {});
            var data = {};
            joli.each(this.options.columns, function(colType, colName) {
                data[colName] = void 0 === values[colName] ? null : values[colName];
            });
            var record = new joli.record(this).fromArray(data);
            record.isNew = function() {
                return true;
            };
            this.options.objectMethods && joli.each(this.options.objectMethods, function(method, name) {
                record[name] = method;
            });
            return record;
        },
        save: function(data) {
            if (0 === data.data.length) return;
            var q = new joli.query();
            data.originalData ? q.update(this.table).set(data.data).where("id = ?", data.originalData.id) : q.insertInto(this.table).values(data.data);
            return q.execute();
        },
        truncate: function() {
            new joli.query().destroy().from(this.table).execute();
        }
    };
    joli.Models = function() {
        this.models = {};
        this.migration = new joli.migration({
            tableName: "migration"
        });
    };
    joli.Models.prototype = {
        get: function(table) {
            return void 0 !== table ? this.models[table] : this.models;
        },
        has: function(table) {
            return this.models[table] ? true : false;
        },
        initialize: function() {
            joli.each(this.models, function(model, modelName) {
                var columns = [];
                joli.each(model.options.columns, function(type, name) {
                    columns.push(name + " " + type);
                });
                var query = "CREATE TABLE IF NOT EXISTS " + modelName + " (" + columns.join(", ") + ")";
                joli.connection.execute(query);
            });
        },
        migrate: function(version, migrationCallback) {
            var query = "CREATE TABLE IF NOT EXISTS " + this.migration.table + " (version)";
            joli.connection.execute(query);
            if (version > this.migration.getVersion()) {
                joli.each(this.models, function(model, modelName) {
                    var query = "DROP TABLE IF EXISTS " + modelName;
                    joli.connection.execute(query);
                });
                migrationCallback && "function" === joli.getType(migrationCallback) && migrationCallback({
                    table: this.migration.table,
                    newVersion: version
                });
                this.migration.setVersion(version);
            }
        },
        set: function(table, model) {
            this.models[table] = model;
        }
    };
    joli.models = new joli.Models();
    joli.query = function() {
        this.data = {
            as: null,
            from: null,
            having: null,
            join: [],
            limit: null,
            operation: null,
            order: [],
            select_columns: "*",
            set: [],
            values: [],
            where: null
        };
    };
    joli.query.prototype = {
        count: function() {
            this.data.operation = "count";
            return this;
        },
        destroy: function() {
            this.data.operation = "delete";
            return this;
        },
        execute: function(hydratationMode) {
            return this.executeQuery(this.getQuery(), hydratationMode);
        },
        executeQuery: function(query, hydratationMode) {
            var rows;
            switch (this.data.operation) {
              case "count":
                rows = joli.connection.execute(query);
                return this.getCount(rows);

              case "insert_into":
                joli.connection.execute(query);
                return joli.connection.lastInsertRowId();

              case "select":
                "undefined" == typeof hydratationMode && (hydratationMode = "object");
                rows = joli.connection.execute(query);
                return this.hydrate(rows, hydratationMode);

              default:
                return joli.connection.execute(query);
            }
        },
        from: function(table) {
            this.data.from = table;
            return this;
        },
        as: function(table) {
            this.data.as = table;
            return this;
        },
        getCount: function(rows) {
            var result;
            if (null === rows) return 0;
            result = 0 === rows.rowCount ? 0 : rows.fieldByName("total");
            rows.close();
            return result;
        },
        getOperation: function() {
            switch (this.data.operation) {
              case "count":
                return "select count(*) as total from " + this.data.from;

              case "delete":
                return "delete from " + this.data.from;

              case "insert_into":
                return "insert into " + this.data.from + " (" + this.data.set.join(", ") + ") values (" + this.data.values.join(", ") + ")";

              case "replace":
                return "replace into " + this.data.from + " (" + this.data.set.join(", ") + ") values (" + this.data.values.join(", ") + ")";

              case "select":
                var join = "";
                this.data.join.length > 0 && joli.each(this.data.join, function(value) {
                    -1 === value[1].indexOf(".") && (value[1] = value[0] + "." + value[1]);
                    join = join + " left outer join " + value[0] + " on " + value[1] + " = " + value[2];
                });
                return "select " + this.data.select_columns + " from " + this.data.from + join;

              case "update":
                return "update " + this.data.from + " set " + this.data.set.join(", ");

              default:
                throw "Operation type Error. joli.query operation type must be an insert, a delete, a select, a replace or an update.";
            }
        },
        getQuery: function() {
            var query = this.getOperation();
            this.data.where && (query += " where " + this.data.where);
            this.data.groupBy && (query += " group by " + this.data.groupBy.join(", "));
            this.data.having && (query += " having " + this.data.having);
            this.data.order.length > 0 && (query += " order by " + this.data.order.join(", "));
            this.data.limit && (query += " limit " + this.data.limit);
            return query;
        },
        groupBy: function(group) {
            "string" === joli.getType(group) && (group = [ group ]);
            this.data.groupBy = group;
            return this;
        },
        having: function(expression, value) {
            null !== this.data.having ? this.data.having += " and " : this.data.having = "";
            if ("array" === joli.getType(value)) {
                var i = 0;
                while (-1 !== expression.indexOf("?") && void 0 !== value[i]) {
                    expression = expression.replace(/\?/i, '"' + value[i] + '"');
                    i++;
                }
                this.data.having += expression;
            } else this.data.having += expression.replace(/\?/gi, '"' + value + '"');
            return this;
        },
        hydrate: function(rows, hydratationMode) {
            var result = [];
            null === hydratationMode && (hydratationMode = "object");
            if (!rows) return result;
            var fieldCount;
            fieldCount = rows.fieldCount;
            switch (hydratationMode) {
              case "array":
                result = this.hydrateArray(rows, fieldCount);
                break;

              case "object":
                result = this.hydrateObject(rows, fieldCount);
                break;

              default:
                throw 'Unknown hydratation mode "' + hydratationMode + '". hydratationMode must be "object" or "array"';
            }
            rows.close();
            return result;
        },
        hydrateArray: function(rows, fieldCount) {
            var result = [];
            var i;
            var rowData;
            while (rows.isValidRow()) {
                i = 0;
                rowData = {};
                while (fieldCount > i) {
                    rowData[rows.fieldName(i)] = rows.field(i);
                    i++;
                }
                result.push(rowData);
                rows.next();
            }
            return result;
        },
        hydrateObject: function(rows, fieldCount) {
            var result = [];
            var i;
            var rowData;
            var model = joli.models.get(this.data.as || this.data.from);
            while (rows.isValidRow()) {
                i = 0;
                rowData = {};
                while (fieldCount > i) {
                    rowData[rows.fieldName(i)] = rows.field(i);
                    i++;
                }
                result.push(model.newRecord().fromArray(rowData));
                rows.next();
            }
            return result;
        },
        insertInto: function(table) {
            this.data.operation = "insert_into";
            this.data.from = table;
            return this;
        },
        join: function(table, local_id, foreign_id) {
            this.data.join.push([ table, local_id, foreign_id ]);
            return this;
        },
        limit: function(limit) {
            this.data.limit = limit;
            return this;
        },
        order: function(order) {
            "string" === joli.getType(order) && (order = [ order ]);
            this.data.order = order;
            return this;
        },
        replace: function(table) {
            this.data.operation = "replace";
            this.data.from = table;
            return this;
        },
        select: function(columns) {
            this.data.operation = "select";
            columns && (this.data.select_columns = columns);
            return this;
        },
        set: function(values) {
            joli.each(values, function(expression, value) {
                -1 === value.indexOf("=") ? this.data.set.push(value + " = " + joli.typeValue(expression)) : this.data.set.push(value);
            }, this);
            return this;
        },
        update: function(table) {
            this.data.operation = "update";
            this.data.from = table;
            return this;
        },
        values: function(values) {
            joli.each(values, function(expression, value) {
                this.data.set.push(value);
                this.data.values.push(joli.typeValue(expression));
            }, this);
            return this;
        },
        where: function(expression, value) {
            null !== this.data.where ? this.data.where += " and " : this.data.where = "";
            if ("array" === joli.getType(value)) {
                var i = 0;
                while (-1 !== expression.indexOf("?") && void 0 !== value[i]) {
                    expression = expression.replace(/\?/i, '"' + value[i] + '"');
                    i++;
                }
                this.data.where += expression;
            } else this.data.where += expression.replace(/\?/gi, '"' + value + '"');
            return this;
        },
        whereIn: function(expression, value) {
            null !== this.data.where ? this.data.where += " and " : this.data.where = "";
            if ("array" === joli.getType(value)) {
                if (0 === value.length) return this;
                value = "('" + value.join("', '") + "')";
            }
            this.data.where += expression + " in " + value;
            return this;
        }
    };
    joli.record = function(table) {
        this._options = {
            table: table
        };
        this._data = {};
    };
    joli.record.prototype = {
        destroy: function() {
            if ("undefined" == typeof this.id) throw "Unsaved record cannot be destroyed";
            this._options.table.deleteRecords(this.id);
        },
        fromArray: function(data) {
            if ("undefined" != typeof data.id) {
                this._originalData = {
                    id: data.id
                };
                this.isNew = function() {
                    return false;
                };
            } else {
                this._originalData = null;
                this.isNew = function() {
                    return true;
                };
            }
            joli.each(this._options.table.getColumns(), function(colType, colName) {
                this[colName] = null;
                this[colName] = data[colName];
                this._data[colName] = null;
                this._data[colName] = data[colName];
                this._originalData && this.isNew() && (this._originalData[colName] = data[colName]);
            }, this);
            return this;
        },
        get: function(key) {
            return this[key];
        },
        isChanged: function() {
            if (this.isNew()) return false;
            return !("undefined" != typeof this.id && joli.toQueryString(this._data) === joli.toQueryString(this._originalData));
        },
        save: function() {
            var data = {
                data: this._data
            };
            if (this.isChanged()) {
                data.originalData = this._originalData;
                this._options.table.save(data);
            } else if (this.isNew()) {
                var rowid = this._options.table.save(data);
                data.id || (this._data.id = rowid);
            }
            this._originalData = {};
            var newData = {};
            joli.each(this._options.table.getColumns(), function(colType, colName) {
                this._originalData[colName] = this._data[colName];
                newData[colName] = this._data[colName];
                this[colName] = this._data[colName];
            }, this);
            this._data = newData;
            this.isNew = function() {
                return false;
            };
            return true;
        },
        set: function(key, value) {
            this[key] = value;
            this._data[key] = value;
        },
        toArray: function() {
            var result = {};
            joli.each(this._options.table.getColumns(), function(colType, colName) {
                result[colName] = this._data[colName];
            }, this);
            return result;
        }
    };
    joli.transaction = function() {
        this.data = {
            commited: false
        };
    };
    joli.transaction.prototype = {
        begin: function() {
            joli.connection.execute("BEGIN;");
        },
        commit: function() {
            if (this.data.commited) throw new Error("The transaction was already commited!");
            joli.connection.execute("COMMIT;");
            this.data.commited = true;
        }
    };
    return joli;
};

var joli = joliCreator();

"object" == typeof exports && exports && (exports.connect = function(database, file) {
    var joli = joliCreator();
    database && (joli.connection = file ? new joli.Connection(database, file) : new joli.Connection(database));
    return joli;
});