def get_location_dic(loc):
    """
    Return dictionary with location code as key & empty dict as the value
    :param loc: string
    :return: dict with locations[string] as key & {} as value
    """
    locations = {}

    area = None

    if loc == "S":
        # H Area
        for column in range(1, 19):
            for level in range(1, 4):
                locations["USLA.H.8." + str(column) + "." + str(level)] = {}

        # S Area
        for aisle in range(1, 57):
            if aisle <= 10:
                max_column = 33
            else:
                max_column = 42
            for column in range(1, max_column + 1):
                if aisle >= 27 and aisle <= 42:
                    max_level = 5
                else:
                    max_level = 6
                for level in range(1, max_level + 1):
                    locations["USLA.S." + str(aisle) + "." + str(column) + "." + str(level)] = {}

    elif loc == "P":
        for aisle in range(1, 28):
            if aisle != 27:
                max_column = 23
            else:
                max_column = 17
            for column in range(1, max_column + 1):
                for level in range(1, 5):
                    locations["USLA.P." + str(aisle) + "." + str(column) + "." + str(level)] = {}
    elif loc == "VC":
        # H Area
        for aisle in range(1, 7):
            for column in range(1, 6):
                for level in range(1, 4):
                    locations["USLA.H." + str(aisle) + "." + str(column) + "." + str(level)] = {}

        # VA Area
        for column in range(1, 23):
            for level in range(1, 4):
                locations["USLA.VA.44." + str(column) + "." + str(level)] = {}

        # VC Area
        for aisle in range(1, 33):
            for column in range(1, 16):
                for level in range(1,6):
                    locations["USLA.VC." + str(aisle) + "." + str(column) + "." + str(level)] = {}
    elif loc == "F":
        # F Area
        for aisle in range(1, 44):
            if aisle != 1:
                max_column = 14
            else:
                max_column = 21
            for column in range(1, max_column + 1):
                for level in range(1, 5):
                    locations["USLA.F." + str(aisle) + "." + str(column) + "." + str(level)] = {}

        # VA Area
        for aisle in range(2, 44):
            for column in range(1, 14):
                if column == 13:
                    min_level = 3
                else:
                    min_level = 1
                for level in range(min_level, 5):
                    locations["USLA.VA." + str(aisle) + "." + str(column) + "." + str(level)] = {}
    return locations